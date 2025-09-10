// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]
#![cfg(not(target_arch = "wasm32"))]

use std::{fs, path::PathBuf};

use clap::{Parser, Subcommand};
use gol_challenge::game::{Board, Condition, Difficulty, Position, Puzzle};

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
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match cli.command {
        Commands::CreatePuzzles { output_dir } => {
            let output_path = output_dir.unwrap_or_else(|| PathBuf::from("."));
            create_puzzles(&output_path)?;
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
    }

    Ok(())
}

fn create_puzzles(output_dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    // Create output directory if it doesn't exist
    fs::create_dir_all(output_dir)?;

    // Generate all pattern puzzles
    let puzzles: Vec<(&str, fn() -> (Puzzle, Board))> = vec![
        ("01_block_pattern", create_block_puzzle_and_solution),
        ("02_beehive_pattern", create_beehive_puzzle_and_solution),
        ("03_loaf_pattern", create_loaf_puzzle_and_solution),
        ("04_boat_pattern", create_boat_puzzle_and_solution),
        ("05_tub_pattern", create_tub_puzzle_and_solution),
        ("06_blinker_pattern", create_blinker_puzzle_and_solution),
        ("07_beacon_pattern", create_beacon_puzzle_and_solution),
        ("08_clock_pattern", create_clock_puzzle_and_solution),
        ("20_robot_face", create_robot_face_puzzle_and_solution),
    ];

    for (name, puzzle_and_solution_creator) in puzzles {
        let (puzzle, solution) = puzzle_and_solution_creator();

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
        let steps = solution.check_puzzle(&puzzle)?;
        println!("Verified solution: {steps} steps");
        println!();
    }

    Ok(())
}

fn create_block_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (2x2 block in center)
    let target_board = Board::with_live_cells(
        6,
        vec![
            Position { x: 2, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 2 },
            Position { x: 3, y: 3 },
        ],
    );

    let puzzle = Puzzle {
        title: "Block Formation".to_string(),
        summary: "Create a stable 2x2 block pattern in the center of the board".to_string(),
        difficulty: Difficulty::Easy,
        size: 6,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![
            // Allow any initial configuration with 4-8 live cells
            Condition::TestRectangle {
                x_range: 0..6,
                y_range: 0..6,
                min_live_count: 4,
                max_live_count: 8,
            },
        ],
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
        7,
        vec![
            Position { x: 2, y: 1 },
            Position { x: 3, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 4, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 3, y: 3 },
        ],
    );

    let puzzle = Puzzle {
        title: "Beehive Formation".to_string(),
        summary: "Create a stable beehive pattern (6-cell hexagonal shape)".to_string(),
        difficulty: Difficulty::Easy,
        size: 7,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..7,
            y_range: 0..7,
            min_live_count: 6,
            max_live_count: 10,
        }],
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
        8,
        vec![
            Position { x: 2, y: 1 },
            Position { x: 3, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 4, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 3, y: 4 },
        ],
    );

    let puzzle = Puzzle {
        title: "Loaf Formation".to_string(),
        summary: "Create a stable loaf pattern (7-cell bread loaf shape)".to_string(),
        difficulty: Difficulty::Easy,
        size: 8,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..8,
            y_range: 0..8,
            min_live_count: 7,
            max_live_count: 10,
        }],
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
        6,
        vec![
            Position { x: 1, y: 1 },
            Position { x: 2, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
        ],
    );

    let puzzle = Puzzle {
        title: "Boat Formation".to_string(),
        summary: "Create a stable boat pattern (5-cell boat shape)".to_string(),
        difficulty: Difficulty::Easy,
        size: 6,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..6,
            y_range: 0..6,
            min_live_count: 5,
            max_live_count: 8,
        }],
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
        5,
        vec![
            Position { x: 2, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
        ],
    );

    let puzzle = Puzzle {
        title: "Tub Formation".to_string(),
        summary: "Create a stable tub pattern (4-cell hollow square)".to_string(),
        difficulty: Difficulty::Easy,
        size: 5,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..5,
            y_range: 0..5,
            min_live_count: 4,
            max_live_count: 7,
        }],
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
        5,
        vec![
            Position { x: 2, y: 1 },
            Position { x: 2, y: 2 },
            Position { x: 2, y: 3 },
        ],
    );

    let puzzle = Puzzle {
        title: "Blinker Formation".to_string(),
        summary: "Create a blinker oscillator pattern (3-cell vertical line that oscillates)"
            .to_string(),
        difficulty: Difficulty::Easy,
        size: 5,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..5,
            y_range: 0..5,
            min_live_count: 3,
            max_live_count: 6,
        }],
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself advanced by 1 (oscillator of period 2)
    (puzzle, target_board.advance_once())
}

fn create_beacon_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (beacon: two 2x2 blocks that blink diagonally)
    // ●●··
    // ●●··
    // ··●●
    // ··●●
    let target_board = Board::with_live_cells(
        6,
        vec![
            Position { x: 1, y: 1 },
            Position { x: 2, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 2, y: 2 },
            Position { x: 3, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 3, y: 4 },
            Position { x: 4, y: 4 },
        ],
    );

    let puzzle = Puzzle {
        title: "Beacon Formation".to_string(),
        summary: "Create a beacon oscillator pattern (two 2x2 blocks that blink diagonally)"
            .to_string(),
        difficulty: Difficulty::Easy,
        size: 6,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..6,
            y_range: 0..6,
            min_live_count: 6,
            max_live_count: 8,
        }],
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself advanced by 1 (oscillator of period 2)
    (puzzle, target_board.advance_once())
}

fn create_clock_puzzle_and_solution() -> (Puzzle, Board) {
    // Define the target pattern (clock: period-4 oscillator in one of its phases)
    // ··●·
    // ●·●
    // ·●·●
    // ·●··
    let target_board = Board::with_live_cells(
        6,
        vec![
            Position { x: 3, y: 1 },
            Position { x: 1, y: 2 },
            Position { x: 3, y: 2 },
            Position { x: 2, y: 3 },
            Position { x: 4, y: 3 },
            Position { x: 2, y: 4 },
        ],
    );

    let puzzle = Puzzle {
        title: "Clock Formation".to_string(),
        summary: "Create a clock oscillator pattern (period-4 oscillator)".to_string(),
        difficulty: Difficulty::Easy,
        size: 6,
        minimal_steps: 1,
        maximal_steps: 1,
        is_strict: false,
        initial_conditions: vec![Condition::TestRectangle {
            x_range: 0..6,
            y_range: 0..6,
            min_live_count: 6,
            max_live_count: 10,
        }],
        // Final conditions: exactly match the target pattern
        final_conditions: target_board.to_exactly_matching_conditions(),
    };

    // Solution is the target pattern itself advanced by 3 steps (period-4 oscillator completes full cycle)
    (puzzle, target_board.advance(3))
}

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
        difficulty: Difficulty::Medium,
        size,
        minimal_steps: 170,
        maximal_steps: 200,
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
    match board.check_puzzle(&puzzle) {
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
