import { Board } from "./domain/entities/Board";
import { Cell } from "./domain/entities/Cell";

/**
 * Check if a cell exists at specific coordinates
 */
export const hasCellAt = (cells: Cell[], x: number, y: number): boolean => {
  return cells.some((c) => c.x === x && c.y === y);
};

/**
 * Check if all specified positions have cells
 */
export const hasAllCells = (cells: Cell[], positions: [number, number][]): boolean => {
  return positions.every(([x, y]) => hasCellAt(cells, x, y));
};

/**
 * Check if none of the specified positions have cells
 */
export const hasNoCells = (cells: Cell[], positions: [number, number][]): boolean => {
  return positions.every(([x, y]) => !hasCellAt(cells, x, y));
};

/**
 * Assert that the board has cells at exactly the specified positions
 */
export const expectCellsAt = (board: Board, positions: [number, number][]): void => {
  const cells = board.getAllAliveCells();
  expect(cells).toHaveLength(positions.length);
  positions.forEach(([x, y]) => {
    expect(hasCellAt(cells, x, y)).toBe(true);
  });
};

/**
 * Assert that the board has no cells at the specified positions
 */
export const expectNoCellsAt = (board: Board, positions: [number, number][]): void => {
  const cells = board.getAllAliveCells();
  positions.forEach(([x, y]) => {
    expect(hasCellAt(cells, x, y)).toBe(false);
  });
};

// Board Setup Helpers

/**
 * Set up a board with cells at specified positions (without saving state)
 */
export const setupBoardWithCells = (board: Board, positions: [number, number][]): void => {
  positions.forEach(([x, y]) => {
    board.toggleCell(x, y);
  });
};

/**
 * Create a generation with cells at specified positions and save state
 */
export const createGeneration = (board: Board, positions: [number, number][]): void => {
  board.clear();
  setupBoardWithCells(board, positions);
  board.saveState();
};

/**
 * Build a complete history with multiple generations
 * Each generation will clear the board and set up new cells
 */
export const buildHistory = (board: Board, generations: [number, number][][]): void => {
  generations.forEach((positions, index) => {
    if (index === 0) {
      // First generation - just set up cells
      setupBoardWithCells(board, positions);
    } else {
      // Subsequent generations - add to existing cells
      const currentCells = positions.filter(
        ([x, y]) => !generations[index - 1].some(([px, py]) => px === x && py === y)
      );
      currentCells.forEach(([x, y]) => {
        board.toggleCell(x, y);
      });
    }
    board.saveState();
  });
};

/**
 * Build incremental history where each generation adds cells to the previous
 */
export const buildIncrementalHistory = (board: Board, cellsToAdd: [number, number][][]): void => {
  cellsToAdd.forEach((newCells, index) => {
    setupBoardWithCells(board, newCells);
    board.saveState();
  });
};

// Navigation Helpers

/**
 * Navigate back a specific number of generations
 */
export const goBackGenerations = (board: Board, count: number): void => {
  for (let i = 0; i < count; i++) {
    if (board.canUndo()) {
      board.undo();
    }
  }
};

/**
 * Navigate to a specific generation from current position
 */
export const goToGeneration = (board: Board, targetGen: number, currentGen: number): void => {
  const diff = currentGen - targetGen;
  if (diff > 0) {
    goBackGenerations(board, diff);
  }
};

// Pattern Creation Helpers

/**
 * Create a blinker pattern (oscillator with period 2)
 */
export const createBlinker = (
  board: Board,
  x: number,
  y: number,
  horizontal: boolean = false
): void => {
  if (horizontal) {
    board.toggleCell(x - 1, y);
    board.toggleCell(x, y);
    board.toggleCell(x + 1, y);
  } else {
    board.toggleCell(x, y - 1);
    board.toggleCell(x, y);
    board.toggleCell(x, y + 1);
  }
};

/**
 * Create a 2x2 block pattern (still life)
 */
export const createBlock = (board: Board, x: number, y: number): void => {
  board.toggleCell(x, y);
  board.toggleCell(x + 1, y);
  board.toggleCell(x, y + 1);
  board.toggleCell(x + 1, y + 1);
};

/**
 * Create a glider pattern
 */
export const createGlider = (board: Board, x: number, y: number): void => {
  // Standard glider pattern
  board.toggleCell(x + 1, y);
  board.toggleCell(x + 2, y + 1);
  board.toggleCell(x, y + 2);
  board.toggleCell(x + 1, y + 2);
  board.toggleCell(x + 2, y + 2);
};

/**
 * Create a toad pattern (oscillator with period 2)
 */
export const createToad = (board: Board, x: number, y: number): void => {
  board.toggleCell(x + 1, y);
  board.toggleCell(x + 2, y);
  board.toggleCell(x + 3, y);
  board.toggleCell(x, y + 1);
  board.toggleCell(x + 1, y + 1);
  board.toggleCell(x + 2, y + 1);
};

// Assertion Helpers

/**
 * Assert that the board has exactly the specified number of alive cells
 */
export const expectCellCount = (board: Board, count: number): void => {
  expect(board.getAllAliveCells()).toHaveLength(count);
};

/**
 * Assert that the board state matches exactly the expected cells
 */
export const expectBoardState = (board: Board, expectedCells: [number, number][]): void => {
  const cells = board.getAllAliveCells();
  expect(cells).toHaveLength(expectedCells.length);

  // Check each expected cell exists
  expectedCells.forEach(([x, y]) => {
    expect(hasCellAt(cells, x, y)).toBe(true);
  });

  // Check no extra cells exist
  cells.forEach((cell) => {
    const isExpected = expectedCells.some(([x, y]) => x === cell.x && y === cell.y);
    expect(isExpected).toBe(true);
  });
};

/**
 * Get cell positions as coordinate strings for easy comparison
 */
export const getCellCoordinates = (board: Board): string[] => {
  return board
    .getAllAliveCells()
    .map((c) => `${c.x},${c.y}`)
    .sort();
};

/**
 * Assert cell coordinates match expected (useful for debugging)
 */
export const expectCoordinates = (board: Board, expected: string[]): void => {
  expect(getCellCoordinates(board)).toEqual(expected.sort());
};

// ============================================
// Pattern Evolution Helpers
// ============================================

/**
 * Expect a blinker to have rotated
 */
export const expectBlinkerRotation = (
  board: Board,
  x: number,
  y: number,
  isHorizontal: boolean
): void => {
  const cells = board.getAllAliveCells();
  expect(cells).toHaveLength(3);

  if (isHorizontal) {
    expect(hasCellAt(cells, x - 1, y)).toBe(true);
    expect(hasCellAt(cells, x, y)).toBe(true);
    expect(hasCellAt(cells, x + 1, y)).toBe(true);
  } else {
    expect(hasCellAt(cells, x, y - 1)).toBe(true);
    expect(hasCellAt(cells, x, y)).toBe(true);
    expect(hasCellAt(cells, x, y + 1)).toBe(true);
  }
};

/**
 * Expect a block to remain stable
 */
export const expectStableBlock = (board: Board, x: number, y: number): void => {
  expectBoardState(board, [
    [x, y],
    [x + 1, y],
    [x, y + 1],
    [x + 1, y + 1],
  ]);
};

/**
 * Clear board and set up a specific pattern
 */
export const resetWithPattern = (board: Board, positions: [number, number][]): void => {
  board.clear();
  setupBoardWithCells(board, positions);
};

// History Testing Helpers

/**
 * Set up a board state and save it as a specific generation
 */
export const saveGeneration = (
  board: Board,
  positions: [number, number][],
  clearFirst: boolean = false
): void => {
  if (clearFirst) {
    board.clear();
  }
  setupBoardWithCells(board, positions);
  board.saveState();
};

/**
 * Verify that history navigation works correctly
 */
export const verifyHistoryNavigation = (
  board: Board,
  expectedStates: [number, number][][],
  currentGen: number
): void => {
  // Check current state
  expectBoardState(board, expectedStates[currentGen]);

  // Go back and check previous states
  for (let i = currentGen - 1; i >= 0; i--) {
    board.undo();
    expectBoardState(board, expectedStates[i]);
  }
};

/**
 * Create a test scenario with drawing at a specific generation
 */
export const drawAtGeneration = (
  board: Board,
  generation: number,
  currentGen: number,
  cellsToAdd: [number, number][]
): void => {
  goToGeneration(board, generation, currentGen);
  setupBoardWithCells(board, cellsToAdd);
  board.replaceCurrentState();
};
