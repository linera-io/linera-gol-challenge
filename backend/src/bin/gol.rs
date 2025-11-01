// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]
#![cfg(not(target_arch = "wasm32"))]

use std::{collections::HashMap, fs, io::Write, path::PathBuf};

use async_graphql::InputType as _;
use clap::{Parser, Subcommand};
use gol_challenge::game::{Board, Condition, Difficulty, Position, Puzzle};
use linera_sdk::linera_base_types::{AccountOwner, ChainId, DataBlobHash};

#[derive(Parser)]
#[command(name = "gol")]
#[command(about = "Game of Life puzzle creation and management tool")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate multiple puzzle files with their solutions
    CreatePuzzles {
        /// Optional output directory (defaults to current directory)
        #[arg(short, long)]
        output_dir: Option<PathBuf>,
        /// Include inactive puzzles as well
        #[arg(long)]
        all: bool,
        /// Only include puzzles containing the given string in their name
        #[arg(long)]
        name: Option<String>,
    },
    /// Generate TypeScript metadata for puzzles
    GenerateMetadata {
        /// Output file path for the TypeScript metadata
        #[arg(short, long)]
        output: PathBuf,
        /// Path to JSON file mapping puzzle names to blob IDs
        #[arg(long)]
        blob_map: PathBuf,
        /// Include inactive puzzles as well
        #[arg(long)]
        all: bool,
        /// Only include puzzles containing the given string in their name
        #[arg(long)]
        name: Option<String>,
    },
    /// Print the contents of a puzzle file
    PrintPuzzle {
        /// Path to the puzzle file to print
        path: PathBuf,
    },
    /// Print the contents of a board file
    PrintBoard {
        /// Path to the board file to print
        path: PathBuf,
        /// Whether to use JSON for the printing
        #[arg(long)]
        json: bool,
    },
    /// Check if a board solves a puzzle
    CheckSolution {
        /// Path to the puzzle file
        puzzle: PathBuf,
        /// Path to the board file
        board: PathBuf,
    },
    /// Generate a GraphQL mutation containing all submitSolution blocks
    GenerateSubmitMutation {
        /// Path to JSON file mapping puzzle names to blob IDs
        #[arg(long)]
        blob_map: PathBuf,
        /// Scoring chain ID to use in the mutation
        #[arg(long)]
        scoring_chain_id: ChainId,
        /// Optional account owner to credit for the solutions
        #[arg(long)]
        owner: Option<AccountOwner>,
        /// Include inactive puzzles as well
        #[arg(long)]
        all: bool,
        /// Only include puzzles containing the given string in their name
        #[arg(long)]
        name: Option<String>,
    },
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match cli.command {
        Commands::CreatePuzzles {
            output_dir,
            all,
            name,
        } => {
            let output_path = output_dir.unwrap_or_else(|| PathBuf::from("."));
            create_puzzles(&output_path, all, name.as_deref())?;
        }
        Commands::GenerateMetadata {
            output,
            blob_map,
            all,
            name,
        } => {
            generate_metadata(&output, &blob_map, all, name.as_deref())?;
        }
        Commands::PrintPuzzle { path } => {
            print_puzzle(&path)?;
        }
        Commands::PrintBoard { path, json } => {
            print_board(&path, json)?;
        }
        Commands::CheckSolution { puzzle, board } => {
            check_solution(&puzzle, &board)?;
        }
        Commands::GenerateSubmitMutation {
            blob_map,
            scoring_chain_id,
            owner,
            all,
            name,
        } => {
            generate_submit_mutation(&blob_map, scoring_chain_id, owner, all, name.as_deref())?;
        }
    }

    Ok(())
}

#[allow(dead_code)]
#[derive(Clone, Copy, Debug)]
enum PuzzleStatus {
    Draft,
    Active,
    Retired,
}

impl PuzzleStatus {
    fn is_active(self) -> bool {
        matches!(self, Self::Active)
    }
}

#[allow(clippy::type_complexity)]
fn get_puzzles(all: bool, filter: Option<&str>) -> Vec<(&'static str, fn() -> (Puzzle, Board))> {
    use PuzzleStatus::*;

    let puzzles: Vec<(&'static str, fn() -> (Puzzle, Board), PuzzleStatus)> = vec![
        ("01_block", create_block_puzzle_and_solution, Active),
        ("02_beehive", create_beehive_puzzle_and_solution, Active),
        ("03_loaf", create_loaf_puzzle_and_solution, Active),
        ("04_boat", create_boat_puzzle_and_solution, Active),
        ("05_tub", create_tub_puzzle_and_solution, Active),
        ("06_blinker", create_blinker_puzzle_and_solution, Active),
        ("07_beacon", create_beacon_puzzle_and_solution, Active),
        ("10_clock", create_clock_puzzle_and_solution, Active),
        (
            "20_glider_migration",
            create_glider_migration_puzzle_and_solution,
            Active,
        ),
        (
            "21_four_blinkers",
            create_four_blinkers_puzzle_and_solution,
            Active,
        ),
        (
            "22_four_blinkers_with_initial_conditions",
            create_four_blinkers_with_initial_conditions_puzzle_and_solution,
            Active,
        ),
        (
            "23_glider_collision_square",
            create_glider_collision_square_puzzle_and_solution,
            Active,
        ),
        (
            "24_glider_collision_cancel",
            create_glider_collision_cancel_puzzle_and_solution,
            Active,
        ),
        (
            "30_robot_face",
            create_robot_face_puzzle_and_solution,
            Draft,
        ),
        ("40_eater", create_eater_puzzle_and_solution, Active),
        (
            "41_glider_reflector_1",
            create_glider_reflector_1_puzzle_and_solution,
            Active,
        ),
        (
            "42_glider_reflector_2",
            create_glider_reflector_2_puzzle_and_solution,
            Active,
        ),
        (
            "43_glider_double_reflector",
            create_glider_double_reflector_puzzle_and_solution,
            Active,
        ),
    ];

    let puzzles: Vec<_> = if all {
        puzzles.into_iter().map(|(name, f, _)| (name, f)).collect()
    } else {
        puzzles
            .into_iter()
            .filter_map(|(name, f, state)| {
                if state.is_active() {
                    Some((name, f))
                } else {
                    None
                }
            })
            .collect()
    };

    if let Some(s) = filter {
        puzzles
            .into_iter()
            .filter_map(|(name, f)| {
                if name.contains(s) {
                    Some((name, f))
                } else {
                    None
                }
            })
            .collect()
    } else {
        puzzles
    }
}

fn generate_metadata(
    output_path: &PathBuf,
    blob_map_path: &PathBuf,
    all: bool,
    name: Option<&str>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Get all puzzle and solution creators
    let puzzles_info = get_puzzles(all, name);

    // Load blob mapping if provided
    let blob_map: HashMap<String, String> = {
        if blob_map_path.exists() {
            let blob_map_content = fs::read_to_string(blob_map_path)?;
            serde_json::from_str(&blob_map_content)?
        } else {
            panic!(
                "Warning: Blob map file not found: {}",
                blob_map_path.display()
            );
        }
    };

    // Create and write to file directly
    let mut file = fs::File::create(output_path)?;

    // Write header comments
    writeln!(
        file,
        "// This file is auto-generated by the gol tool. Do not edit manually."
    )?;
    writeln!(
        file,
        "// To regenerate: cargo run --bin gol -- generate-metadata -o path/to/output.ts --blob-map path/to/blob-mapping.json"
    )?;
    writeln!(file, "//")?;
    writeln!(file, "// To get real blob IDs:")?;
    writeln!(file, "// 1. Run: cargo run --bin gol -- create-puzzles")?;
    writeln!(
        file,
        "// 2. For each puzzle file, run: linera publish-data-blob <puzzle_name>_puzzle.bcs"
    )?;
    writeln!(
        file,
        "// 3. Create a blob mapping JSON file and use --blob-map option"
    )?;
    writeln!(file)?;

    // Write TypeScript interface
    writeln!(
        file,
        "import {{ PuzzleMetadata, DifficultyLevel }} from \"@/lib/types/puzzle.types\";"
    )?;
    writeln!(file)?;
    writeln!(file, "// Re-export for backward compatibility")?;
    writeln!(
        file,
        "export type {{ PuzzleMetadata }} from \"@/lib/types/puzzle.types\";"
    )?;
    writeln!(file)?;

    // Write puzzle array
    writeln!(file, "export const KNOWN_PUZZLES: PuzzleMetadata[] = [")?;

    for (name, puzzle_creator) in puzzles_info {
        let (puzzle, _) = puzzle_creator();

        let puzzle_id = if let Some(blob_id) = blob_map.get(name) {
            blob_id.clone()
        } else {
            panic!("Puzzle ID for name {name} is missing");
        };

        writeln!(file, "  {{")?;
        writeln!(file, "    id: \"{}\",", puzzle_id)?;
        writeln!(file, "    title: \"{}\",", puzzle.title)?;
        writeln!(file, "    summary: \"{}\",", puzzle.summary)?;
        writeln!(
            file,
            "    difficulty: \"{}\",",
            puzzle.difficulty.to_value()
        )?;
        writeln!(file, "    size: {},", puzzle.size)?;
        writeln!(file, "  }},")?;
    }

    writeln!(file, "];")?;
    writeln!(file)?;

    // Write helper functions
    writeln!(file, "// Helper to get puzzle by ID")?;
    writeln!(
        file,
        "export function getPuzzleMetadata(id: string): PuzzleMetadata | undefined {{"
    )?;
    writeln!(
        file,
        "  return KNOWN_PUZZLES.find((puzzle) => puzzle.id === id);"
    )?;
    writeln!(file, "}}")?;
    writeln!(file)?;

    writeln!(file, "// Helper to get puzzles by difficulty")?;
    writeln!(
        file,
        "export function getPuzzlesByDifficulty(difficulty: DifficultyLevel): PuzzleMetadata[] {{"
    )?;
    writeln!(
        file,
        "  return KNOWN_PUZZLES.filter((puzzle) => puzzle.difficulty === difficulty);"
    )?;
    writeln!(file, "}}")?;

    println!(
        "Generated TypeScript metadata at: {}",
        output_path.display()
    );

    Ok(())
}

fn create_puzzles(
    output_dir: &PathBuf,
    all: bool,
    name: Option<&str>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Create output directory if it doesn't exist.
    fs::create_dir_all(output_dir)?;

    // Generate puzzles.
    let puzzles = get_puzzles(all, name);

    for (name, puzzle_and_solution_creator) in puzzles {
        let (mut puzzle, solution) = puzzle_and_solution_creator();

        let puzzle_path = output_dir.join(format!("{}_puzzle.bcs", name));
        let solution_path = output_dir.join(format!("{}_solution.bcs", name));

        let puzzle_bytes = bcs::to_bytes(&puzzle)?;
        let solution_bytes = bcs::to_bytes(&solution)?;

        fs::write(&puzzle_path, puzzle_bytes)?;
        fs::write(&solution_path, solution_bytes)?;

        println!("Created puzzle: {}", puzzle_path.display());
        println!("{puzzle:#}");
        println!("Created solution: {}", solution_path.display());
        println!("{solution:#}");
        puzzle.enforce_initial_conditions = true;
        let steps = puzzle.check_solution(&solution)?;
        println!("Verified solution (and hints): {steps} steps");
        println!();
    }

    Ok(())
}

fn create_block_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (2x2 block in center)
    let target_board = Board::with_live_cells(
        8,
        vec![
            Position { x: 3, y: 3 },
            Position { x: 3, y: 4 },
            Position { x: 4, y: 3 },
            Position { x: 4, y: 4 },
        ],
    );

    let initial_conditions = vec![Condition::TestRectangle {
        x_range: 0..8,
        y_range: 0..8,
        min_live_count: 4,
        max_live_count: 4,
    }];

    let puzzle = Puzzle {
        title: "Block".to_string(),
        summary: "Create a stable 2x2 block pattern in the center of the board".to_string(),
        difficulty: Difficulty::Tutorial,
        size: 8,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself (stable)
    (puzzle, target_board)
}

fn create_beehive_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (beehive: hexagonal shape)
    //  ●●
    // ●  ●
    //  ●●
    let target_board = Board::with_live_cells(
        9,
        vec![
            Position { x: 3, y: 2 },
            Position { x: 4, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 5, y: 3 },
            Position { x: 3, y: 4 },
            Position { x: 4, y: 4 },
        ],
    );

    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = target_board.to_exactly_matching_conditions();
    initial_conditions.remove(5);
    initial_conditions.remove(4);

    let puzzle = Puzzle {
        title: "Beehive".to_string(),
        summary: "Create a stable beehive pattern (6-cell hexagonal shape)".to_string(),
        difficulty: Difficulty::Tutorial,
        size: 9,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself (stable)
    (puzzle, target_board)
}

fn create_loaf_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (loaf: bread loaf shape)
    //  ●●
    // ●  ●
    //  ● ●
    //   ●
    let target_board = Board::with_live_cells(
        10,
        vec![
            Position { x: 3, y: 2 },
            Position { x: 4, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 5, y: 3 },
            Position { x: 3, y: 4 },
            Position { x: 5, y: 4 },
            Position { x: 4, y: 5 },
        ],
    );

    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = target_board.to_exactly_matching_conditions();
    initial_conditions.remove(6);
    initial_conditions.remove(5);

    let puzzle = Puzzle {
        title: "Loaf".to_string(),
        summary: "Create a stable loaf pattern (7-cell bread loaf shape)".to_string(),
        difficulty: Difficulty::Tutorial,
        size: 10,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself (stable)
    (puzzle, target_board)
}

fn create_boat_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (boat shape)
    // ●●
    // ● ●
    //  ●
    let target_board = Board::with_live_cells(
        8,
        vec![
            Position { x: 2, y: 2 },
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 3, y: 4 },
        ],
    );

    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = target_board.to_exactly_matching_conditions();
    initial_conditions.remove(4);
    initial_conditions.remove(3);

    let puzzle = Puzzle {
        title: "Boat".to_string(),
        summary: "Create a stable boat pattern (5-cell boat shape)".to_string(),
        difficulty: Difficulty::Tutorial,
        size: 8,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself (stable)
    (puzzle, target_board)
}

fn create_tub_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (tub: hollow square)
    //  ●
    // ● ●
    //  ●
    let target_board = Board::with_live_cells(
        7,
        vec![
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 3, y: 4 },
        ],
    );

    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = target_board.to_exactly_matching_conditions();
    initial_conditions.remove(3);
    initial_conditions.remove(2);

    let puzzle = Puzzle {
        title: "Tub".to_string(),
        summary: "Create a stable tub pattern (4-cell hollow square)".to_string(),
        difficulty: Difficulty::Tutorial,
        size: 7,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself (stable)
    (puzzle, target_board)
}

fn create_blinker_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (blinker: vertical 3-cell oscillator)
    // ●
    // ●
    // ●
    let target_board = Board::with_live_cells(
        7,
        vec![
            Position { x: 3, y: 2 },
            Position { x: 3, y: 3 },
            Position { x: 3, y: 4 },
        ],
    );

    // Solution is the target pattern itself advanced by 1 (oscillator of period 2).
    let initial_board = target_board.advance_once();
    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    initial_conditions.remove(2);
    initial_conditions.remove(0);

    let puzzle = Puzzle {
        title: "Blinker".to_string(),
        summary: "Create a blinker oscillator pattern (3-cell vertical line that oscillates)"
            .to_string(),
        difficulty: Difficulty::Tutorial,
        size: 7,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    (puzzle, initial_board)
}

fn create_beacon_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (beacon: two 2x2 blocks that blink diagonally)
    // ●●··
    // ●●··
    // ··●●
    // ··●●
    let target_board = Board::with_live_cells(
        8,
        vec![
            Position { x: 2, y: 2 },
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
            Position { x: 4, y: 4 },
            Position { x: 5, y: 4 },
            Position { x: 4, y: 5 },
            Position { x: 5, y: 5 },
        ],
    );

    // Solution is the target pattern itself advanced by 1 (oscillator of period 2).
    let initial_board = target_board.advance_once();
    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    initial_conditions.remove(5);
    initial_conditions.remove(0);

    let puzzle = Puzzle {
        title: "Beacon".to_string(),
        summary: "Create a beacon oscillator pattern (two 2x2 blocks that blink diagonally)"
            .to_string(),
        difficulty: Difficulty::Easy,
        size: 8,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    (puzzle, initial_board)
}

fn create_clock_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (clock: period-4 oscillator in one of its phases)
    // ··●·
    // ●·●
    // ·●·●
    // ·●··
    let target_board = Board::with_live_cells(
        8,
        vec![
            Position { x: 4, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 3, y: 4 },
            Position { x: 5, y: 4 },
            Position { x: 3, y: 5 },
        ],
    );

    // Solution is the target pattern itself advanced by 3 steps (period-4 oscillator completes full cycle).
    let initial_board = target_board.advance(3);
    // Create initial conditions: target pattern minus two cells.
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    initial_conditions.remove(5);
    initial_conditions.remove(0);

    let puzzle = Puzzle {
        title: "Clock".to_string(),
        summary: "Create a clock oscillator pattern (period-4 oscillator)".to_string(),
        difficulty: Difficulty::Easy,
        size: 8,
        metadata: String::new(),
        minimal_steps: 1,
        maximal_steps: 1,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    (puzzle, initial_board)
}

fn create_four_blinkers_puzzle_and_solution() -> (Puzzle, Board) {
    let size = 16;
    let offset = size / 2 - 1;
    // Define the initial board.
    let initial_board = Board::with_live_cells(
        size,
        vec![
            Position {
                x: offset,
                y: offset - 1,
            },
            Position {
                x: offset - 2,
                y: offset,
            },
            Position {
                x: offset - 1,
                y: offset,
            },
            Position {
                x: offset + 1,
                y: offset,
            },
            Position {
                x: offset + 2,
                y: offset,
            },
            Position {
                x: offset,
                y: offset + 1,
            },
        ],
    );
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    // Drop a point to force a lucky guess.
    initial_conditions.remove(3);
    initial_conditions.remove(0);

    // Define the final board.
    let final_board = initial_board.advance(10);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let puzzle = Puzzle {
        title: "Four Blinkers 1".to_string(),
        summary: "Create four blinkers from very few cells".to_string(),
        difficulty: Difficulty::Easy,
        size,
        metadata: String::new(),
        minimal_steps: 10,
        maximal_steps: 10,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_four_blinkers_with_initial_conditions_puzzle_and_solution() -> (Puzzle, Board) {
    let (mut puzzle, board) = create_four_blinkers_puzzle_and_solution();
    puzzle.title = "Four Blinkers 2".to_string();
    puzzle.summary = "Create four blinkers from very few cells (strict variant).".to_string();
    puzzle.difficulty = Difficulty::Medium;
    puzzle.enforce_initial_conditions = true;
    (puzzle, board)
}

#[allow(clippy::identity_op)]
fn create_robot_face_puzzle_and_solution() -> (Puzzle, Board) {
    let size = 60;
    let offset = size / 2 - 2;
    // Define the initial board.
    let initial_board = Board::with_live_cells(
        size,
        vec![
            Position {
                x: offset + 0,
                y: offset + 0,
            },
            Position {
                x: offset + 1,
                y: offset + 0,
            },
            Position {
                x: offset + 2,
                y: offset + 0,
            },
            Position {
                x: offset + 0,
                y: offset + 1,
            },
            Position {
                x: offset + 2,
                y: offset + 1,
            },
            Position {
                x: offset + 0,
                y: offset + 2,
            },
            Position {
                x: offset + 2,
                y: offset + 2,
            },
        ],
    );
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    // Drop a point to force a lucky guess.
    initial_conditions.remove(3);

    // Define the final board.
    let final_board = initial_board.advance(180);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let puzzle = Puzzle {
        title: "Robot face".to_string(),
        summary: "Create a robot-like face from very few cells".to_string(),
        difficulty: Difficulty::Easy,
        size,
        metadata: String::new(),
        minimal_steps: 174,
        maximal_steps: 174,
        enforce_initial_conditions: true,
        is_strict: false,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_collision_square_puzzle_and_solution() -> (Puzzle, Board) {
    // Create two gliders on a collision course that will create a square.
    // First glider (moving down-right) starting at top-left
    // Second glider (moving up-left) starting at bottom-right
    let initial_board = Board::with_live_cells(
        12,
        vec![
            // First glider (top-left, moving down-right)
            Position { x: 2, y: 1 },
            Position { x: 3, y: 2 },
            Position { x: 1, y: 3 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
            // Second glider (bottom-right, moving up-left)
            // Glider pattern rotated 180 degrees
            Position { x: 9, y: 10 },
            Position { x: 8, y: 9 },
            Position { x: 10, y: 8 },
            Position { x: 9, y: 8 },
            Position { x: 8, y: 8 },
        ],
    );

    // After collision, the board should be empty or nearly empty
    let final_board = initial_board.advance(16);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let puzzle = Puzzle {
        title: "Glider Collision 1".to_string(),
        summary: "Make two gliders collide and create a square".to_string(),
        difficulty: Difficulty::Medium,
        size: 12,
        metadata: String::new(),
        minimal_steps: 14,
        maximal_steps: 14,
        enforce_initial_conditions: true,
        is_strict: true,
        initial_conditions: vec![
            // First glider should be in top-left area
            Condition::TestRectangle {
                x_range: 0..5,
                y_range: 0..5,
                min_live_count: 5,
                max_live_count: 5,
            },
            // Second glider should be in bottom-right area
            Condition::TestRectangle {
                x_range: 7..12,
                y_range: 7..12,
                min_live_count: 5,
                max_live_count: 5,
            },
        ],
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_collision_cancel_puzzle_and_solution() -> (Puzzle, Board) {
    // Create two gliders on a collision course that will cancel each other out
    // First glider (moving down-right) starting at top-left
    // Second glider (moving up-left) starting at bottom-right
    let initial_board = Board::with_live_cells(
        12,
        vec![
            // First glider (top-left, moving down-right)
            Position { x: 2, y: 1 },
            Position { x: 3, y: 2 },
            Position { x: 1, y: 3 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
            // Second glider (bottom-right, moving up-left)
            // Glider pattern rotated 180 degrees
            Position { x: 8, y: 9 },
            Position { x: 7, y: 8 },
            Position { x: 9, y: 7 },
            Position { x: 8, y: 7 },
            Position { x: 7, y: 7 },
        ],
    );

    // After collision, the board should be empty or nearly empty
    let final_board = initial_board.advance(16);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let puzzle = Puzzle {
        title: "Glider Collision 2".to_string(),
        summary: "Make two gliders collide and cancel each other out".to_string(),
        difficulty: Difficulty::Medium,
        size: 12,
        metadata: String::new(),
        minimal_steps: 16,
        maximal_steps: 16,
        enforce_initial_conditions: true,
        is_strict: true,
        initial_conditions: vec![
            // First glider should be in top-left area
            Condition::TestRectangle {
                x_range: 0..5,
                y_range: 0..5,
                min_live_count: 5,
                max_live_count: 5,
            },
            // Second glider should be in bottom-right area
            Condition::TestRectangle {
                x_range: 7..12,
                y_range: 7..12,
                min_live_count: 5,
                max_live_count: 5,
            },
        ],
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_migration_puzzle_and_solution() -> (Puzzle, Board) {
    // Place a glider pattern in the top-left square.
    let initial_board = Board::with_live_cells(
        16,
        vec![
            Position { x: 2, y: 1 },
            Position { x: 3, y: 2 },
            Position { x: 1, y: 3 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
        ],
    );

    let final_board = initial_board.advance(40);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let puzzle = Puzzle {
        title: "Glider Migration".to_string(),
        summary: "Guide a glider from the top-left square to the bottom-right square".to_string(),
        difficulty: Difficulty::Easy,
        size: 16,
        metadata: String::new(),
        minimal_steps: 40,
        maximal_steps: 40,
        enforce_initial_conditions: false,
        is_strict: false,
        initial_conditions: vec![
            // Hint.
            Condition::TestPosition {
                position: Position { x: 3, y: 3 },
                is_live: true,
            },
            // All 5 cells should be in top-left square (0-7, 0-7).
            Condition::TestRectangle {
                x_range: 0..8,
                y_range: 0..8,
                min_live_count: 5,
                max_live_count: 5,
            },
            // No cells elsewhere.
            Condition::TestRectangle {
                x_range: 8..16,
                y_range: 0..8,
                min_live_count: 0,
                max_live_count: 0,
            },
            Condition::TestRectangle {
                x_range: 0..16,
                y_range: 8..16,
                min_live_count: 0,
                max_live_count: 0,
            },
        ],
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_eater_puzzle_and_solution() -> (Puzzle, Board) {
    // An eater is a stable pattern that can consume gliders
    // Pattern looks like:
    // ●●
    // ● ●
    //   ●
    //   ●●

    // We'll have a glider approaching from the left, and the player needs to place an eater
    // to consume it, leaving just the eater behind

    let size = 16;

    // Place glider on the left side, approaching the eater position
    // Place eater in the middle-right area
    let initial_board = Board::with_live_cells(
        size,
        vec![
            // Glider moving right and down, starting at left
            Position { x: 2, y: 1 },
            Position { x: 3, y: 2 },
            Position { x: 1, y: 3 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
            // Eater pattern in middle-right area
            Position { x: 10, y: 10 },
            Position { x: 11, y: 10 },
            Position { x: 10, y: 11 },
            Position { x: 12, y: 11 },
            Position { x: 12, y: 12 },
            Position { x: 12, y: 13 },
            Position { x: 13, y: 13 },
        ],
    );

    // After the glider is eaten, only the eater remains (it's stable)
    let final_board = Board::with_live_cells(
        size,
        vec![
            // Eater pattern in middle-right area
            Position { x: 10, y: 10 },
            Position { x: 11, y: 10 },
            Position { x: 10, y: 11 },
            Position { x: 12, y: 11 },
            Position { x: 12, y: 12 },
            Position { x: 12, y: 13 },
            Position { x: 13, y: 13 },
        ],
    );
    let final_conditions = final_board.to_exactly_matching_conditions();
    let mut initial_conditions = final_conditions.clone();
    // Remove default TestRectangle
    initial_conditions.pop().unwrap();
    initial_conditions.push(
        // Glider should be on the top-left corner
        Condition::TestRectangle {
            x_range: 0..6,
            y_range: 0..6,
            min_live_count: 5,
            max_live_count: 5,
        },
    );
    // Set total count.
    initial_conditions.push(Condition::TestRectangle {
        x_range: 0..size,
        y_range: 0..size,
        min_live_count: 12,
        max_live_count: 12,
    });
    let puzzle = Puzzle {
        title: "Eater".to_string(),
        summary: "Place an eater pattern to consume an approaching glider".to_string(),
        difficulty: Difficulty::Medium,
        size,
        metadata: String::new(),
        minimal_steps: 26,
        maximal_steps: 26,
        enforce_initial_conditions: true,
        is_strict: true,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_reflector_1_puzzle_and_solution() -> (Puzzle, Board) {
    let size = 24;

    // Initial glider moving up-right
    let initial_board = Board::with_live_cells(
        size,
        vec![
            // Glider starting top-left, moving down-right
            Position { x: 2, y: 10 },
            Position { x: 3, y: 10 },
            Position { x: 3, y: 11 },
            Position { x: 4, y: 11 },
            Position { x: 2, y: 12 },
            // The pentadecathlon
            Position { x: 11, y: 10 },
            Position { x: 12, y: 10 },
            Position { x: 13, y: 9 },
            Position { x: 13, y: 11 },
            Position { x: 14, y: 10 },
            Position { x: 15, y: 10 },
            Position { x: 16, y: 10 },
            Position { x: 17, y: 10 },
            Position { x: 18, y: 9 },
            Position { x: 18, y: 11 },
            Position { x: 19, y: 10 },
            Position { x: 20, y: 10 },
        ],
    );
    // Advancing one step to keep the glider in a familiar shape.
    let initial_board = initial_board.advance(1);

    // After reflection, glider should be moving in different direction
    let final_board = initial_board.advance(30);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let mut initial_conditions = Board::with_live_cells(
        size,
        vec![
            Position { x: 11, y: 10 },
            Position { x: 12, y: 10 },
            Position { x: 13, y: 9 },
            Position { x: 13, y: 11 },
            Position { x: 14, y: 10 },
            Position { x: 15, y: 10 },
            Position { x: 16, y: 10 },
            Position { x: 17, y: 10 },
            Position { x: 18, y: 9 },
            Position { x: 18, y: 11 },
            Position { x: 19, y: 10 },
            Position { x: 20, y: 10 },
        ],
    )
    .advance(1)
    .to_exactly_matching_conditions();
    initial_conditions.pop().unwrap();
    initial_conditions.push(
        // Glider should be on the left
        Condition::TestRectangle {
            x_range: 1..5,
            y_range: 10..14,
            min_live_count: 5,
            max_live_count: 5,
        },
    );
    // Set total count.
    initial_conditions.push(Condition::TestRectangle {
        x_range: 0..size,
        y_range: 0..size,
        min_live_count: 27,
        max_live_count: 27,
    });
    let puzzle = Puzzle {
        title: "Glider Reflector 1".to_string(),
        summary: "Reflect a glider by 180 degrees".to_string(),
        difficulty: Difficulty::Medium,
        size,
        metadata: String::new(),
        minimal_steps: 30,
        maximal_steps: 30,
        enforce_initial_conditions: true,
        is_strict: true,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_reflector_2_puzzle_and_solution() -> (Puzzle, Board) {
    let size = 24;

    // Initial glider moving up-right
    let initial_board = Board::with_live_cells(
        size,
        vec![
            // Glider starting top-left, moving down-right
            Position { x: 2, y: 10 },
            Position { x: 3, y: 10 },
            Position { x: 3, y: 11 },
            Position { x: 4, y: 11 },
            Position { x: 2, y: 12 },
            // The pentadecathlon
            Position { x: 11, y: 10 },
            Position { x: 12, y: 10 },
            Position { x: 13, y: 9 },
            Position { x: 13, y: 11 },
            Position { x: 14, y: 10 },
            Position { x: 15, y: 10 },
            Position { x: 16, y: 10 },
            Position { x: 17, y: 10 },
            Position { x: 18, y: 9 },
            Position { x: 18, y: 11 },
            Position { x: 19, y: 10 },
            Position { x: 20, y: 10 },
        ],
    );
    // Not advancing one step, so the glider is in non-standard shape.
    // After reflection, glider should be moving in different direction
    let final_board = initial_board.advance(30);
    let final_conditions = final_board.to_exactly_matching_conditions();

    let mut initial_conditions = Board::with_live_cells(
        size,
        vec![
            Position { x: 11, y: 10 },
            Position { x: 12, y: 10 },
            Position { x: 13, y: 9 },
            Position { x: 13, y: 11 },
            Position { x: 14, y: 10 },
            Position { x: 15, y: 10 },
            Position { x: 16, y: 10 },
            Position { x: 17, y: 10 },
            Position { x: 18, y: 9 },
            Position { x: 18, y: 11 },
            Position { x: 19, y: 10 },
            Position { x: 20, y: 10 },
        ],
    )
    .to_exactly_matching_conditions();
    initial_conditions.pop().unwrap();
    initial_conditions.push(
        // Glider should be on the left
        Condition::TestRectangle {
            x_range: 1..5,
            y_range: 10..14,
            min_live_count: 5,
            max_live_count: 5,
        },
    );
    // Set total count.
    initial_conditions.push(Condition::TestRectangle {
        x_range: 0..size,
        y_range: 0..size,
        min_live_count: 17,
        max_live_count: 17,
    });
    let puzzle = Puzzle {
        title: "Glider Reflector 2".to_string(),
        summary: "Reflect a glider by 180 degrees".to_string(),
        difficulty: Difficulty::Hard,
        size,
        metadata: String::new(),
        minimal_steps: 30,
        maximal_steps: 30,
        enforce_initial_conditions: true,
        is_strict: false,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn create_glider_double_reflector_puzzle_and_solution() -> (Puzzle, Board) {
    let size = 41;

    // Initial glider moving up-right
    let initial_board = Board::with_live_cells(
        size,
        vec![
            // Glider starting top-left, moving down-right
            Position { x: 19, y: 10 },
            Position { x: 20, y: 10 },
            Position { x: 20, y: 11 },
            Position { x: 21, y: 11 },
            Position { x: 19, y: 12 },
            // The first pentadecathlon
            Position { x: 28, y: 10 },
            Position { x: 29, y: 10 },
            Position { x: 30, y: 9 },
            Position { x: 30, y: 11 },
            Position { x: 31, y: 10 },
            Position { x: 32, y: 10 },
            Position { x: 33, y: 10 },
            Position { x: 34, y: 10 },
            Position { x: 35, y: 9 },
            Position { x: 35, y: 11 },
            Position { x: 36, y: 10 },
            Position { x: 37, y: 10 },
            // The second pentadecathlon
            Position { x: 3, y: 14 },
            Position { x: 4, y: 14 },
            Position { x: 5, y: 13 },
            Position { x: 5, y: 15 },
            Position { x: 6, y: 14 },
            Position { x: 7, y: 14 },
            Position { x: 8, y: 14 },
            Position { x: 9, y: 14 },
            Position { x: 10, y: 13 },
            Position { x: 10, y: 15 },
            Position { x: 11, y: 14 },
            Position { x: 12, y: 14 },
        ],
    );
    // We should do a round-trip in 60 steps.
    let mut initial_conditions = initial_board.to_exactly_matching_conditions();
    // Do not force the glider.
    initial_conditions.drain(12..17);
    initial_conditions.insert(
        0,
        // Glider should be at the center.
        Condition::TestRectangle {
            x_range: 19..22,
            y_range: 10..13,
            min_live_count: 5,
            max_live_count: 5,
        },
    );
    initial_conditions.insert(
        0,
        // The center of a glider is alive (unlike a boat).
        Condition::TestPosition {
            position: Position { x: 20, y: 11 },
            is_live: true,
        },
    );
    let final_conditions = initial_conditions.clone();

    let puzzle = Puzzle {
        title: "Glider Double Reflector".to_string(),
        summary: "Use two reflectors to bounce a glider indefinitely".to_string(),
        difficulty: Difficulty::Hard,
        size,
        metadata: String::new(),
        minimal_steps: 60,
        maximal_steps: 60,
        enforce_initial_conditions: true,
        is_strict: false,
        initial_conditions,
        final_conditions,
    };

    (puzzle, initial_board)
}

fn print_puzzle(path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let puzzle_bytes = fs::read(path)?;
    let puzzle: Puzzle = bcs::from_bytes(&puzzle_bytes)?;
    println!("{:#}", puzzle);
    Ok(())
}

fn print_board(path: &PathBuf, json: bool) -> Result<(), Box<dyn std::error::Error>> {
    let board_bytes = fs::read(path)?;
    let board: Board = bcs::from_bytes(&board_bytes)?;
    if json {
        println!("{}", serde_json::to_string_pretty(&board)?);
    } else {
        println!("Board:");
        println!("{:#}", board);
    }
    Ok(())
}

fn check_solution(
    puzzle_path: &PathBuf,
    board_path: &PathBuf,
) -> Result<(), Box<dyn std::error::Error>> {
    // Read puzzle file
    let puzzle_bytes = fs::read(puzzle_path)?;
    let puzzle: Puzzle = bcs::from_bytes(&puzzle_bytes)?;

    // Read board file
    let board_bytes = fs::read(board_path)?;
    let board: Board = bcs::from_bytes(&board_bytes)?;

    // Check if board solves the puzzle
    match puzzle.check_solution(&board) {
        Ok(steps) => {
            println!("✅ Solution is VALID!");
            println!("   Initial board passes all initial conditions");
            println!(
                "   After {} steps, board passes all final conditions",
                steps
            );
        }
        Err(error) => {
            println!("❌ Solution is INVALID!");
            println!("   Error: {}", error);
        }
    }

    Ok(())
}

fn generate_submit_mutation(
    blob_map_path: &PathBuf,
    scoring_chain_id: ChainId,
    owner: Option<AccountOwner>,
    all: bool,
    name: Option<&str>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Get all puzzle and solution creators
    let puzzles_info = get_puzzles(all, name);

    // Load blob mapping
    let blob_map: HashMap<String, DataBlobHash> = {
        if blob_map_path.exists() {
            let blob_map_content = fs::read_to_string(blob_map_path)?;
            serde_json::from_str(&blob_map_content)?
        } else {
            panic!(
                "Error: Blob map file not found: {}",
                blob_map_path.display()
            );
        }
    };

    // Start building the mutation
    println!("mutation {{");

    for (index, (name, puzzle_creator)) in puzzles_info.iter().enumerate() {
        let (_, solution_board) = puzzle_creator();

        let puzzle_id = if let Some(blob_id) = blob_map.get(*name) {
            blob_id
        } else {
            eprintln!("Warning: Puzzle ID for name {} is missing, skipping", name);
            continue;
        };

        // Convert Board to JSON to access its fields
        let board_json = serde_json::to_value(&solution_board)?;

        // Extract size and liveCells from the JSON value
        let size = board_json["size"]
            .as_u64()
            .ok_or("Failed to get size from board")?;

        let live_cells_array = board_json["live_cells"]
            .as_array()
            .ok_or("Failed to get live_cells from board")?;

        // Convert live cells to GraphQL format
        let live_cells = live_cells_array
            .iter()
            .filter_map(|cell| {
                let x = cell["x"].as_u64()?;
                let y = cell["y"].as_u64()?;
                Some(format!("{{ x: {}, y: {} }}", x, y))
            })
            .collect::<Vec<_>>()
            .join(", ");

        // Generate alias for this mutation
        let alias = format!("puzzle{}", index);

        // Write the submitSolution mutation block
        println!("  {}: submitSolution(", alias);
        println!("    puzzleId: {}", puzzle_id.to_value());
        println!(
            "    board: {{ size: {}, liveCells: [{}] }}",
            size, live_cells
        );
        if let Some(owner) = owner {
            println!("    owner: {}", owner.to_value());
        }
        println!("    scoringChainId: {}", scoring_chain_id.to_value());
        println!("  )");
    }

    println!("}}");

    Ok(())
}
