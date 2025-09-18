import { Board } from '../Board';
import {
  expectCellsAt,
  expectCellCount,
  expectBoardState,
  setupBoardWithCells,
  goBackGenerations,
  buildIncrementalHistory
} from '../../../test-helpers';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board({ width: 10, height: 10, infinite: false });
  });

  describe('initialization', () => {
    it('should create a board with correct dimensions', () => {
      expect(board.config.width).toBe(10);
      expect(board.config.height).toBe(10);
      expect(board.config.infinite).toBe(false);
    });

    it('should start with no alive cells', () => {
      expectCellCount(board, 0);
    });

    it('should start with no history', () => {
      expect(board.hasInitialState()).toBe(false);
    });
  });

  describe('toggleCell', () => {
    it('should toggle a dead cell to alive', () => {
      board.toggleCell(5, 5);
      expectCellsAt(board, [[5, 5]]);
    });

    it('should toggle an alive cell to dead', () => {
      board.toggleCell(5, 5);
      board.toggleCell(5, 5);
      expectCellCount(board, 0);
    });

    it('should handle multiple cells', () => {
      setupBoardWithCells(board, [[1, 1], [2, 2], [3, 3]]);
      expectBoardState(board, [[1, 1], [2, 2], [3, 3]]);
    });
  });

  describe('clear', () => {
    it('should remove all cells', () => {
      setupBoardWithCells(board, [[1, 1], [2, 2], [3, 3]]);
      board.clear();
      expectCellCount(board, 0);
    });

    it('should clear history', () => {
      board.toggleCell(1, 1);
      board.saveState();
      board.clear();
      expect(board.hasInitialState()).toBe(false);
    });
  });

  describe('saveState and history management', () => {
    it('should save initial state', () => {
      board.toggleCell(1, 1);
      board.saveState();
      expect(board.hasInitialState()).toBe(true);
    });

    it('should allow undo after multiple saves', () => {
      // Build incremental history
      buildIncrementalHistory(board, [
        [[1, 1]],     // Generation 0
        [[2, 2]]      // Generation 1
      ]);

      expect(board.canUndo()).toBe(true);
      expectBoardState(board, [[1, 1], [2, 2]]);

      // Undo to generation 0
      goBackGenerations(board, 1);
      expectBoardState(board, [[1, 1]]);
    });

    it('should truncate future history when saving after undo', () => {
      // Create 3 states
      buildIncrementalHistory(board, [
        [[1, 1]],     // State 0
        [[2, 2]],     // State 1
        [[3, 3]]      // State 2
      ]);

      // Go back to state 1
      goBackGenerations(board, 1);

      // Create new branch
      board.toggleCell(4, 4);
      board.saveState(); // New state 2

      // Should have 3 alive cells (1,1), (2,2), and (4,4)
      expectBoardState(board, [[1, 1], [2, 2], [4, 4]]);

      // Should not be able to redo to old state 2
      expect(board.isAtEndOfHistory()).toBe(true);
    });
  });

  describe('replaceCurrentState', () => {
    it('should replace current state when history exists', () => {
      board.toggleCell(1, 1);
      board.saveState();

      board.toggleCell(2, 2);
      board.replaceCurrentState();

      // Should still be at same history position but with updated state
      expectBoardState(board, [[1, 1], [2, 2]]);
    });

    it('should create initial state when no history exists', () => {
      board.toggleCell(1, 1);
      board.replaceCurrentState();

      expect(board.hasInitialState()).toBe(true);
      expectCellCount(board, 1);
    });

    it('should update state at any generation', () => {
      // Build incremental history
      buildIncrementalHistory(board, [
        [[1, 1]],     // Generation 0
        [[2, 2]],     // Generation 1
        [[3, 3]]      // Generation 2
      ]);

      // Go back to generation 1
      goBackGenerations(board, 1);

      // Modify generation 1
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Generation 1 should now have (1,1), (2,2), and (4,4)
      expectBoardState(board, [[1, 1], [2, 2], [4, 4]]);

      // When we undo to generation 0, should only have (1,1)
      goBackGenerations(board, 1);
      expectBoardState(board, [[1, 1]]);

      // Can't undo further
      expect(board.canUndo()).toBe(false);
    });
  });

  describe('resetToInitialState', () => {
    it('should reset to generation 0 and clear future history', () => {
      // Create multiple states
      buildIncrementalHistory(board, [
        [[1, 1]],     // Gen 0
        [[2, 2]],     // Gen 1
        [[3, 3]]      // Gen 2
      ]);

      // Reset to initial
      board.resetToInitialState();

      // Should be at generation 0 with only (1,1)
      expectBoardState(board, [[1, 1]]);

      // Should have cleared future history
      expect(board.isAtEndOfHistory()).toBe(true);
      expect(board.canUndo()).toBe(false);
    });
  });

  describe('isAtEndOfHistory', () => {
    it('should return true when at last state', () => {
      board.toggleCell(1, 1);
      board.saveState();
      expect(board.isAtEndOfHistory()).toBe(true);
    });

    it('should return false when in middle of history', () => {
      buildIncrementalHistory(board, [
        [[1, 1]],
        [[2, 2]]
      ]);
      goBackGenerations(board, 1);
      expect(board.isAtEndOfHistory()).toBe(false);
    });
  });

  describe('countAliveNeighbors', () => {
    it('should count neighbors correctly', () => {
      setupBoardWithCells(board, [[1, 1], [1, 2], [2, 1]]);

      expect(board.countAliveNeighbors(1, 1)).toBe(2);
      expect(board.countAliveNeighbors(2, 2)).toBe(3);
      expect(board.countAliveNeighbors(0, 0)).toBe(1);
    });

    it('should handle edge cases in bounded mode', () => {
      const boundedBoard = new Board({ width: 3, height: 3, infinite: false });
      setupBoardWithCells(boundedBoard, [[0, 0], [0, 1]]);

      expect(boundedBoard.countAliveNeighbors(0, 0)).toBe(1);
      expect(boundedBoard.countAliveNeighbors(1, 0)).toBe(2);
    });
  });
});