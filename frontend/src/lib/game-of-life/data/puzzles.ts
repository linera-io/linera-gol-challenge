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
    id: "4d74a8a0466df69a8d2e4b16e1ebe4a82e067cad460c22130bf4542cc39ea7fe",
    title: "Block Pattern",
    summary: "Create a stable block pattern (2x2 square)",
    difficulty: "Easy",
  },
  {
    id: "d35f92421b00a3bd3d92e01c11e45ea9c3cc7d4a510005b3664009540f7a7da0",
    title: "Beehive Formation",
    summary: "Create a stable beehive pattern (6-cell hexagonal shape)",
    difficulty: "Easy",
  },
  {
    id: "4133771d8a2e82b75ae7528167cb3a3338aebd97a26304996a55d3d7b26de814",
    title: "Loaf Pattern",
    summary: "Create a stable loaf pattern",
    difficulty: "Easy",
  },
  {
    id: "35ce219839e8ee7b9d22370e8b7ec889b205f28547d53a496e69b0c2bb1bc4f0",
    title: "Boat Pattern",
    summary: "Create a stable boat pattern",
    difficulty: "Easy",
  },
  {
    id: "5219a384d3ba16dda76d1a8dbbb4acc4b2cbace5a0318ce6439ce0eb0eb4bd31",
    title: "Tub Pattern",
    summary: "Create a stable tub pattern",
    difficulty: "Easy",
  },
  {
    id: "b0608e739a7b58f076849cf9aa9039a1ae348d4c0670f867e961548f30ddb264",
    title: "Blinker Pattern",
    summary: "Create an oscillating blinker pattern (period 2)",
    difficulty: "Medium",
  },
  {
    id: "5a32e9c47e4622f80967b5e2de7d3a67b783d2b0afb89985e5de1af430a872e9",
    title: "Beacon Pattern",
    summary: "Create an oscillating beacon pattern (period 2)",
    difficulty: "Medium",
  },
  {
    id: "46baa2d3ad40d2113711ff7eee67d47e343b079fddc29daf6206a23ec7a54200",
    title: "Clock Pattern",
    summary: "Create an oscillating clock pattern (period 2)",
    difficulty: "Medium",
  },
  {
    id: "e7de932762b0a6a27d29097f20caa0084c87a61fb6e21d5f49cc88c1e5542479",
    title: "Robot Face",
    summary: "Create a fun robot face pattern",
    difficulty: "Hard",
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
