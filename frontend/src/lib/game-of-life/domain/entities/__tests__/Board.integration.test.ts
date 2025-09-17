import { Board } from '../Board';

describe('Board - History Management Integration Tests', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board({ width: 10, height: 10, infinite: false });
  });

  describe('Drawing persistence across generations', () => {
    it('should preserve drawings when navigating forward then back', () => {
      // Draw initial pattern at generation 0
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.saveState();

      // Advance to generation 1
      board.toggleCell(3, 3);
      board.saveState();

      // Advance to generation 2
      board.toggleCell(4, 4);
      board.saveState();

      // Go back to generation 1
      board.undo();

      // Draw something new at generation 1
      board.toggleCell(5, 5);
      board.replaceCurrentState();

      // Cells at gen 1 should now be: (1,1), (2,2), (3,3), (5,5)
      let cells = board.getAllAliveCells();
      expect(cells).toHaveLength(4);

      const hasCellAt = (x: number, y: number) =>
        cells.some(c => c.x === x && c.y === y);

      expect(hasCellAt(1, 1)).toBe(true);
      expect(hasCellAt(2, 2)).toBe(true);
      expect(hasCellAt(3, 3)).toBe(true);
      expect(hasCellAt(5, 5)).toBe(true);

      // Go back to generation 0
      board.undo();
      cells = board.getAllAliveCells();
      expect(cells).toHaveLength(2);
      expect(cells.some(c => c.x === 1 && c.y === 1)).toBe(true);
      expect(cells.some(c => c.x === 2 && c.y === 2)).toBe(true);
    });

    it('should handle drawing at generation 0 after navigation', () => {
      // Create initial state
      board.toggleCell(1, 1);
      board.saveState(); // Gen 0

      // Advance
      board.toggleCell(2, 2);
      board.saveState(); // Gen 1

      board.toggleCell(3, 3);
      board.saveState(); // Gen 2

      // Navigate back to gen 0
      board.undo();
      board.undo();

      // Draw at generation 0
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Should have (1,1) and (4,4) at gen 0
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(2);
      expect(cells.some(c => c.x === 1 && c.y === 1)).toBe(true);
      expect(cells.some(c => c.x === 4 && c.y === 4)).toBe(true);
    });
  });

  describe('History truncation on forward navigation', () => {
    it('should truncate future history when saving new state after undo', () => {
      // Build history
      board.toggleCell(1, 1);
      board.saveState(); // Gen 0

      board.toggleCell(2, 2);
      board.saveState(); // Gen 1

      board.toggleCell(3, 3);
      board.saveState(); // Gen 2

      board.toggleCell(4, 4);
      board.saveState(); // Gen 3

      // Go back to gen 1
      board.undo();
      board.undo();

      // Create new branch from gen 1
      board.toggleCell(5, 5);
      board.saveState(); // New gen 2

      // Should be at end of history now
      expect(board.isAtEndOfHistory()).toBe(true);

      // Old gen 2 and 3 should be gone
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3); // (1,1), (2,2), (5,5)
      expect(cells.some(c => c.x === 3 && c.y === 3)).toBe(false);
      expect(cells.some(c => c.x === 4 && c.y === 4)).toBe(false);
    });
  });

  describe('Reset to initial state', () => {
    it('should properly reset and clear future history', () => {
      // Create complex history
      board.toggleCell(1, 1);
      board.saveState(); // Gen 0

      board.toggleCell(2, 2);
      board.saveState(); // Gen 1

      board.toggleCell(3, 3);
      board.saveState(); // Gen 2

      // Go back to gen 1
      board.undo();

      // Modify gen 1
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Reset to initial
      board.resetToInitialState();

      // Should be at gen 0 with only initial cell
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(1);
      expect(cells[0].x).toBe(1);
      expect(cells[0].y).toBe(1);

      // Should be at end of history (future cleared)
      expect(board.isAtEndOfHistory()).toBe(true);
      expect(board.canUndo()).toBe(false);

      // Creating new state should work normally
      board.toggleCell(5, 5);
      board.saveState();

      expect(board.canUndo()).toBe(true);
      expect(board.getAllAliveCells()).toHaveLength(2);
    });
  });

  describe('Complex navigation scenarios', () => {
    it('should handle rapid back and forth navigation with modifications', () => {
      // Create initial states
      board.toggleCell(1, 1);
      board.saveState(); // Gen 0

      board.toggleCell(2, 1);
      board.saveState(); // Gen 1

      board.toggleCell(3, 1);
      board.saveState(); // Gen 2

      // Navigate and modify
      board.undo(); // Back to gen 1
      board.toggleCell(2, 2);
      board.replaceCurrentState();

      board.undo(); // Back to gen 0
      board.toggleCell(1, 2);
      board.replaceCurrentState();

      // Verify gen 0 state
      let cells = board.getAllAliveCells();
      expect(cells).toHaveLength(2);

      // Move forward and verify modifications persist
      board.saveState(); // This shouldn't be needed but let's advance
      board.toggleCell(5, 5);
      board.saveState();

      board.undo(); // Back to modified gen 0
      cells = board.getAllAliveCells();
      expect(cells).toHaveLength(2);
      expect(cells.some(c => c.x === 1 && c.y === 1)).toBe(true);
      expect(cells.some(c => c.x === 1 && c.y === 2)).toBe(true);
    });

    it('should handle empty board states in history', () => {
      // Start with cells
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.saveState(); // Gen 0 with cells

      // Clear all cells
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.saveState(); // Gen 1 empty

      // Add new cells
      board.toggleCell(3, 3);
      board.saveState(); // Gen 2 with new cell

      // Navigate back through empty state
      board.undo(); // Gen 1 (empty)
      expect(board.getAllAliveCells()).toHaveLength(0);

      board.undo(); // Gen 0
      expect(board.getAllAliveCells()).toHaveLength(2);

      // Modify empty state
      board.undo(); // Can't go further back
      expect(board.canUndo()).toBe(false);
    });
  });

  describe('State replacement edge cases', () => {
    it('should handle replaceCurrentState at boundary conditions', () => {
      // Test at history index -1 (no history)
      board.toggleCell(1, 1);
      board.replaceCurrentState();
      expect(board.hasInitialState()).toBe(true);
      expect(board.getAllAliveCells()).toHaveLength(1);

      // Test at history index 0
      board.toggleCell(2, 2);
      board.replaceCurrentState();
      expect(board.getAllAliveCells()).toHaveLength(2);

      // Add more states
      board.toggleCell(3, 3);
      board.saveState(); // Gen 1

      // Test replacement at end of history
      board.toggleCell(4, 4);
      board.replaceCurrentState();
      expect(board.getAllAliveCells()).toHaveLength(4);
      expect(board.isAtEndOfHistory()).toBe(true);
    });

    it('should maintain consistency when replacing state multiple times', () => {
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
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(4);

      // History should still work
      board.saveState();
      board.toggleCell(5, 5);
      board.saveState();

      board.undo();
      expect(board.getAllAliveCells()).toHaveLength(4);
    });
  });

  describe('Pattern evolution with history', () => {
    it('should correctly track blinker pattern through evolution', () => {
      // Create horizontal blinker
      board.toggleCell(4, 3);
      board.toggleCell(4, 4);
      board.toggleCell(4, 5);
      board.saveState(); // Gen 0 - vertical

      // Manually evolve (simulate what GameEngine would do)
      board.clear();
      board.toggleCell(3, 4);
      board.toggleCell(4, 4);
      board.toggleCell(5, 4);
      board.saveState(); // Gen 1 - horizontal

      // Evolve again
      board.clear();
      board.toggleCell(4, 3);
      board.toggleCell(4, 4);
      board.toggleCell(4, 5);
      board.saveState(); // Gen 2 - vertical again

      // Navigate back and verify states
      board.undo(); // Gen 1
      let cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);
      // Check horizontal blinker positions
      const hasHorizontal = cells.some(c => c.x === 3 && c.y === 4) ||
                           cells.some(c => c.x === 4 && c.y === 4) ||
                           cells.some(c => c.x === 5 && c.y === 4);
      expect(hasHorizontal).toBe(true);

      board.undo(); // Gen 0
      cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);
      // Check vertical blinker positions
      const hasVertical = cells.some(c => c.x === 4 && c.y === 3) ||
                         cells.some(c => c.x === 4 && c.y === 4) ||
                         cells.some(c => c.x === 4 && c.y === 5);
      expect(hasVertical).toBe(true);

      // Modify gen 0 and see if forward computation would work correctly
      board.toggleCell(5, 5); // Add extra cell
      board.replaceCurrentState();

      cells = board.getAllAliveCells();
      expect(cells).toHaveLength(4);
    });
  });
});