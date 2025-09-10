// Known puzzle IDs from the blockchain
// These are DataBlobHash IDs of puzzles published to the chain

export interface PuzzleMetadata {
  id: string;
  title: string;
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const KNOWN_PUZZLES: PuzzleMetadata[] = [
  {
    id: "c6f2b2e1a4bb32a6f2d1cbf29fd43f35fc51a20ca6eb4cafbc3bb20499f8a4ba",
    title: "Beehive Formation",
    summary: "Create a stable beehive pattern (6-cell hexagonal shape)",
    difficulty: "Easy",
  },
  {
    id: "1f33e8395acce7b5f38f070d1a86cab39efad8bc3ce5f9bfc61068ad9cdee474",
    title: "Block Pattern",
    summary: "Create a stable block pattern (2x2 square)",
    difficulty: "Easy",
  },
  {
    id: "f2e811992609f8664b63933ea1c41e440d832cf644836cf5a2d58e8f5d15264e",
    title: "Boat Pattern",
    summary: "Create a stable boat pattern",
    difficulty: "Easy",
  },
  // Additional puzzles can be added here as they are published to the chain
];

// Default board size for all puzzles but this will be overridden by the puzzle size from the chain once it loads
export const PUZZLE_BOARD_SIZE = 7;

// Helper to get puzzle by ID
export function getPuzzleMetadata(id: string): PuzzleMetadata | undefined {
  return KNOWN_PUZZLES.find((puzzle) => puzzle.id === id);
}

// Helper to get puzzles by difficulty
export function getPuzzlesByDifficulty(
  difficulty: "Easy" | "Medium" | "Hard"
): PuzzleMetadata[] {
  return KNOWN_PUZZLES.filter((puzzle) => puzzle.difficulty === difficulty);
}
