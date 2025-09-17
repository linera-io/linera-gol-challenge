import { Board } from "../Board";

describe("Board", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board({ width: 10, height: 10, infinite: false });
  });

  describe("initialization", () => {
    it("should create a board with correct dimensions", () => {
      expect(board.config.width).toBe(10);
      expect(board.config.height).toBe(10);
      expect(board.config.infinite).toBe(false);
    });

    it("should start with no alive cells", () => {
      expect(board.getAllAliveCells()).toHaveLength(0);
    });

    it("should start with no history", () => {
      expect(board.hasInitialState()).toBe(false);
    });
  });

  describe("toggleCell", () => {
    it("should toggle a dead cell to alive", () => {
      board.toggleCell(5, 5);
      const aliveCells = board.getAllAliveCells();
      expect(aliveCells).toHaveLength(1);
      expect(aliveCells[0].x).toBe(5);
      expect(aliveCells[0].y).toBe(5);
    });

    it("should toggle an alive cell to dead", () => {
      board.toggleCell(5, 5);
      board.toggleCell(5, 5);
      expect(board.getAllAliveCells()).toHaveLength(0);
    });

    it("should handle multiple cells", () => {
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.toggleCell(3, 3);
      expect(board.getAllAliveCells()).toHaveLength(3);
    });
  });

  describe("clear", () => {
    it("should remove all cells", () => {
      board.toggleCell(1, 1);
      board.toggleCell(2, 2);
      board.toggleCell(3, 3);
      board.clear();
      expect(board.getAllAliveCells()).toHaveLength(0);
    });

    it("should clear history", () => {
      board.toggleCell(1, 1);
      board.saveState();
      board.clear();
      expect(board.hasInitialState()).toBe(false);
    });
  });

  describe("saveState and history management", () => {
    it("should save initial state", () => {
      board.toggleCell(1, 1);
      board.saveState();
      expect(board.hasInitialState()).toBe(true);
    });

    it("should allow undo after multiple saves", () => {
      // Generation 0
      board.toggleCell(1, 1);
      board.saveState();

      // Generation 1
      board.toggleCell(2, 2);
      board.saveState();

      expect(board.canUndo()).toBe(true);
      expect(board.getAllAliveCells()).toHaveLength(2);

      // Undo to generation 0
      board.undo();
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(1);
      expect(cells[0].x).toBe(1);
      expect(cells[0].y).toBe(1);
    });

    it("should truncate future history when saving after undo", () => {
      // Create 3 states
      board.toggleCell(1, 1);
      board.saveState(); // State 0

      board.toggleCell(2, 2);
      board.saveState(); // State 1

      board.toggleCell(3, 3);
      board.saveState(); // State 2

      // Go back to state 1
      board.undo();

      // Create new branch
      board.toggleCell(4, 4);
      board.saveState(); // New state 2

      // Should have 3 alive cells (1,1), (2,2), and (4,4)
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);

      // Should not be able to redo to old state 2
      expect(board.isAtEndOfHistory()).toBe(true);
    });
  });

  describe("replaceCurrentState", () => {
    it("should replace current state when history exists", () => {
      board.toggleCell(1, 1);
      board.saveState();

      board.toggleCell(2, 2);
      board.replaceCurrentState();

      // Should still be at same history position but with updated state
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(2);
    });

    it("should create initial state when no history exists", () => {
      board.toggleCell(1, 1);
      board.replaceCurrentState();

      expect(board.hasInitialState()).toBe(true);
      expect(board.getAllAliveCells()).toHaveLength(1);
    });

    it("should update state at any generation", () => {
      // Generation 0
      board.toggleCell(1, 1);
      board.saveState();

      // Generation 1
      board.toggleCell(2, 2);
      board.saveState();

      // Generation 2
      board.toggleCell(3, 3);
      board.saveState();

      // Go back to generation 1
      board.undo();

      // Modify generation 1
      board.toggleCell(4, 4);
      board.replaceCurrentState();

      // Generation 1 should now have (1,1), (2,2), and (4,4)
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);

      // When we undo to generation 0, should only have (1,1)
      board.undo();
      const cellsGen0 = board.getAllAliveCells();
      expect(cellsGen0).toHaveLength(1);
      expect(cellsGen0[0].x).toBe(1);

      // When we go forward to generation 1, should see our modification
      board.undo(); // This won't do anything since we're at 0
      expect(board.canUndo()).toBe(false);
    });
  });

  describe("resetToInitialState", () => {
    it("should reset to generation 0 and clear future history", () => {
      // Create multiple states
      board.toggleCell(1, 1);
      board.saveState(); // Gen 0

      board.toggleCell(2, 2);
      board.saveState(); // Gen 1

      board.toggleCell(3, 3);
      board.saveState(); // Gen 2

      // Reset to initial
      board.resetToInitialState();

      // Should be at generation 0 with only (1,1)
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(1);
      expect(cells[0].x).toBe(1);

      // Should have cleared future history
      expect(board.isAtEndOfHistory()).toBe(true);
      expect(board.canUndo()).toBe(false);
    });
  });

  describe("isAtEndOfHistory", () => {
    it("should return true when at last state", () => {
      board.toggleCell(1, 1);
      board.saveState();
      expect(board.isAtEndOfHistory()).toBe(true);
    });

    it("should return false when in middle of history", () => {
      board.toggleCell(1, 1);
      board.saveState();
      board.toggleCell(2, 2);
      board.saveState();
      board.undo();
      expect(board.isAtEndOfHistory()).toBe(false);
    });
  });

  describe("countAliveNeighbors", () => {
    it("should count neighbors correctly", () => {
      board.toggleCell(1, 1);
      board.toggleCell(1, 2);
      board.toggleCell(2, 1);

      expect(board.countAliveNeighbors(1, 1)).toBe(2);
      expect(board.countAliveNeighbors(2, 2)).toBe(3);
      expect(board.countAliveNeighbors(0, 0)).toBe(1);
    });

    it("should handle edge cases in bounded mode", () => {
      const boundedBoard = new Board({ width: 3, height: 3, infinite: false });
      boundedBoard.toggleCell(0, 0);
      boundedBoard.toggleCell(0, 1);

      expect(boundedBoard.countAliveNeighbors(0, 0)).toBe(1);
      expect(boundedBoard.countAliveNeighbors(1, 0)).toBe(2);
    });
  });
});
