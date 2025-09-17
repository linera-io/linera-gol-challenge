import { Cell } from '../Cell';

describe('Cell', () => {
  describe('initialization', () => {
    it('should create a dead cell by default', () => {
      const cell = new Cell(5, 10);
      expect(cell.x).toBe(5);
      expect(cell.y).toBe(10);
      expect(cell.alive).toBe(false);
    });

    it('should create an alive cell when specified', () => {
      const cell = new Cell(3, 7, true);
      expect(cell.x).toBe(3);
      expect(cell.y).toBe(7);
      expect(cell.alive).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const cell = new Cell(-5, -10);
      expect(cell.x).toBe(-5);
      expect(cell.y).toBe(-10);
      expect(cell.alive).toBe(false);
    });

    it('should handle zero coordinates', () => {
      const cell = new Cell(0, 0);
      expect(cell.x).toBe(0);
      expect(cell.y).toBe(0);
      expect(cell.alive).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle dead cell to alive', () => {
      const cell = new Cell(1, 1);
      expect(cell.alive).toBe(false);

      cell.toggle();
      expect(cell.alive).toBe(true);
    });

    it('should toggle alive cell to dead', () => {
      const cell = new Cell(1, 1, true);
      expect(cell.alive).toBe(true);

      cell.toggle();
      expect(cell.alive).toBe(false);
    });

    it('should handle multiple toggles', () => {
      const cell = new Cell(1, 1);

      cell.toggle(); // alive
      expect(cell.alive).toBe(true);

      cell.toggle(); // dead
      expect(cell.alive).toBe(false);

      cell.toggle(); // alive
      expect(cell.alive).toBe(true);

      cell.toggle(); // dead
      expect(cell.alive).toBe(false);
    });
  });

  describe('setAlive', () => {
    it('should set cell to alive', () => {
      const cell = new Cell(1, 1);
      cell.setAlive(true);
      expect(cell.alive).toBe(true);
    });

    it('should set cell to dead', () => {
      const cell = new Cell(1, 1, true);
      cell.setAlive(false);
      expect(cell.alive).toBe(false);
    });

    it('should handle redundant sets', () => {
      const cell = new Cell(1, 1, true);

      cell.setAlive(true);
      expect(cell.alive).toBe(true);

      cell.setAlive(true);
      expect(cell.alive).toBe(true);

      cell.setAlive(false);
      expect(cell.alive).toBe(false);

      cell.setAlive(false);
      expect(cell.alive).toBe(false);
    });
  });

  describe('immutability of coordinates', () => {
    it('should maintain coordinates after creation', () => {
      const cell = new Cell(5, 10);

      // Coordinates should remain unchanged
      expect(cell.x).toBe(5);
      expect(cell.y).toBe(10);

      // Even after state changes
      cell.toggle();
      expect(cell.x).toBe(5);
      expect(cell.y).toBe(10);
    });
  });

  describe('equality and identity', () => {
    it('should maintain reference identity', () => {
      const cell1 = new Cell(1, 1);
      const cell2 = cell1;

      cell1.toggle();
      expect(cell2.alive).toBe(true); // Same reference
    });

    it('should create distinct instances', () => {
      const cell1 = new Cell(1, 1);
      const cell2 = new Cell(1, 1);

      cell1.toggle();
      expect(cell1.alive).toBe(true);
      expect(cell2.alive).toBe(false); // Different instance
    });
  });
});