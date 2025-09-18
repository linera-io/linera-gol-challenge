import { Board } from "../Board";
import {
  expectBoardState,
  expectCellCount,
  setupBoardWithCells,
  buildIncrementalHistory,
  goBackGenerations,
  createBlinker,
  hasCellAt,
  expectNoCellsAt,
} from "../../../test-helpers";

describe("Board - History Management Integration Tests", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board({ width: 10, height: 10, infinite: false });
  });

  describe("Drawing persistence across generations", () => {
    it("should preserve drawings when navigating forward then back", () => {
      // Build incremental history
      buildIncrementalHistory(board, [
        [
          [1, 1],
          [2, 2],
        ], // Gen 0
        [[3, 3]], // Gen 1 adds (3,3)
        [[4, 4]], // Gen 2 adds (4,4)
      ]);

      // Go back to generation 1
      goBackGenerations(board, 1);

      // Draw something new at generation 1
      board.toggleCell(5, 5);
      board.replaceCurrentState();

      // Cells at gen 1 should now be: (1,1), (2,2), (3,3), (5,5)
      expectBoardState(board, [
        [1, 1],
        [2, 2],
        [3, 3],
        [5, 5],
      ]);

      // Go back to generation 0
      goBackGenerations(board, 1);
      expectBoardState(board, [
        [1, 1],
        [2, 2],
      ]);
    });

    it("should handle drawing at generation 0 after navigation", () => {
      // Build incremental history
      buildIncrementalHistory(board, [
        [[1, 1]], // Gen 0
        [[2, 2]], // Gen 1
        [[3, 3]], // Gen 2
      ]);

      // Navigate back to gen 0
      goBackGenerations(board, 2);

      // Draw at generation 0
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Should have (1,1) and (4,4) at gen 0
      expectBoardState(board, [
        [1, 1],
        [4, 4],
      ]);
    });
  });

  describe("History truncation on forward navigation", () => {
    it("should truncate future history when saving new state after undo", () => {
      // Build incremental history
      buildIncrementalHistory(board, [
        [[1, 1]], // Gen 0
        [[2, 2]], // Gen 1
        [[3, 3]], // Gen 2
        [[4, 4]], // Gen 3
      ]);

      // Go back to gen 1
      goBackGenerations(board, 2);

      // Create new branch from gen 1
      board.toggleCell(5, 5);
      board.saveState(); // New gen 2

      // Should be at end of history now
      expect(board.isAtEndOfHistory()).toBe(true);

      // Old gen 2 and 3 should be gone, should have (1,1), (2,2), (5,5)
      expectBoardState(board, [
        [1, 1],
        [2, 2],
        [5, 5],
      ]);
      expectNoCellsAt(board, [
        [3, 3],
        [4, 4],
      ]);
    });
  });

  describe("Reset to initial state", () => {
    it("should properly reset and clear future history", () => {
      // Create complex history
      buildIncrementalHistory(board, [
        [[1, 1]], // Gen 0
        [[2, 2]], // Gen 1
        [[3, 3]], // Gen 2
      ]);

      // Go back to gen 1
      goBackGenerations(board, 1);

      // Modify gen 1
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Reset to initial
      board.resetToInitialState();

      // Should be at gen 0 with only initial cell
      expectBoardState(board, [[1, 1]]);

      // Should be at end of history (future cleared)
      expect(board.isAtEndOfHistory()).toBe(true);
      expect(board.canUndo()).toBe(false);

      // Creating new state should work normally
      board.toggleCell(5, 5);
      board.saveState();

      expect(board.canUndo()).toBe(true);
      expectCellCount(board, 2);
    });
  });

  describe("Complex navigation scenarios", () => {
    it("should handle rapid back and forth navigation with modifications", () => {
      // Create initial states
      buildIncrementalHistory(board, [
        [[1, 1]], // Gen 0
        [[2, 1]], // Gen 1
        [[3, 1]], // Gen 2
      ]);

      // Navigate and modify
      goBackGenerations(board, 1); // Back to gen 1
      board.toggleCell(2, 2);
      board.replaceCurrentState();

      goBackGenerations(board, 1); // Back to gen 0
      board.toggleCell(1, 2);
      board.replaceCurrentState();

      // Verify gen 0 state
      expectBoardState(board, [
        [1, 1],
        [1, 2],
      ]);

      // Move forward and verify modifications persist
      board.toggleCell(5, 5);
      board.saveState();

      goBackGenerations(board, 1); // Back to modified gen 0
      expectBoardState(board, [
        [1, 1],
        [1, 2],
      ]);
    });

    it("should handle empty board states in history", () => {
      // Start with cells
      setupBoardWithCells(board, [
        [1, 1],
        [2, 2],
      ]);
      board.saveState(); // Gen 0 with cells

      // Clear all cells for gen 1
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.saveState(); // Gen 1 empty

      // Add new cells for gen 2
      board.toggleCell(3, 3);
      board.saveState(); // Gen 2 with new cell

      // Navigate back through empty state
      goBackGenerations(board, 1); // Gen 1 (empty)
      expectCellCount(board, 0);

      goBackGenerations(board, 1); // Gen 0
      expectBoardState(board, [
        [1, 1],
        [2, 2],
      ]);

      // Can't go further back
      expect(board.canUndo()).toBe(false);
    });
  });

  describe("State replacement edge cases", () => {
    it("should handle replaceCurrentState at boundary conditions", () => {
      // Test at history index -1 (no history)
      board.toggleCell(1, 1);
      board.replaceCurrentState();
      expect(board.hasInitialState()).toBe(true);
      expectCellCount(board, 1);

      // Test at history index 0
      board.toggleCell(2, 2);
      board.replaceCurrentState();
      expectCellCount(board, 2);

      // Add more states
      board.toggleCell(3, 3);
      board.saveState(); // Gen 1

      // Test replacement at end of history
      board.toggleCell(4, 4);
      board.replaceCurrentState();
      expectBoardState(board, [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ]);
      expect(board.isAtEndOfHistory()).toBe(true);
    });

    it("should maintain consistency when replacing state multiple times", () => {
      board.toggleCell(1, 1);
      board.saveState();

      // Replace multiple times at same position
      board.toggleCell(2, 2);
      board.replaceCurrentState();

      board.toggleCell(3, 3);
      board.replaceCurrentState();

      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Should have all 4 cells
      expectBoardState(board, [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ]);

      // History should still work
      board.saveState();
      board.toggleCell(5, 5);
      board.saveState();

      goBackGenerations(board, 1);
      expectCellCount(board, 4);
    });
  });

  describe("Pattern evolution with history", () => {
    it("should correctly track blinker pattern through evolution", () => {
      // Create vertical blinker
      createBlinker(board, 4, 4, false);
      board.saveState(); // Gen 0 - vertical

      // Manually evolve to horizontal (simulate what GameEngine would do)
      board.clear();
      createBlinker(board, 4, 4, true);
      board.saveState(); // Gen 1 - horizontal

      // Evolve back to vertical
      board.clear();
      createBlinker(board, 4, 4, false);
      board.saveState(); // Gen 2 - vertical again

      // Navigate back and verify states
      goBackGenerations(board, 1); // Gen 1
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);
      // Check horizontal blinker
      expect(hasCellAt(cells, 3, 4) || hasCellAt(cells, 4, 4) || hasCellAt(cells, 5, 4)).toBe(true);

      goBackGenerations(board, 1); // Gen 0
      expectCellCount(board, 3);
      // Check vertical blinker
      const cellsGen0 = board.getAllAliveCells();
      expect(
        hasCellAt(cellsGen0, 4, 3) || hasCellAt(cellsGen0, 4, 4) || hasCellAt(cellsGen0, 4, 5)
      ).toBe(true);

      // Modify gen 0 and verify
      board.toggleCell(5, 5); // Add extra cell
      board.replaceCurrentState();

      expectCellCount(board, 4);
    });
  });
});
