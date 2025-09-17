import { GameEngine } from '../GameEngine';
import { Board } from '../../domain/entities/Board';

describe('GameEngine', () => {
  let board: Board;
  let engine: GameEngine;

  beforeEach(() => {
    board = new Board({ width: 10, height: 10, infinite: false });
    engine = new GameEngine(board);
  });

  describe('nextGeneration', () => {
    it('should compute next generation correctly', () => {
      // Create a blinker
      board.toggleCell(4, 3);
      board.toggleCell(4, 4);
      board.toggleCell(4, 5);

      engine.nextGeneration();

      // Should rotate to horizontal
      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(3);

      const coordinates = cells.map(c => `${c.x},${c.y}`).sort();
      expect(coordinates).toEqual(['3,4', '4,4', '5,4']);
    });

    it('should handle empty board', () => {
      engine.nextGeneration();
      expect(board.getAllAliveCells()).toHaveLength(0);
    });

    it('should create a block pattern (stable)', () => {
      // Create a 2x2 block
      board.toggleCell(1, 1);
      board.toggleCell(1, 2);
      board.toggleCell(2, 1);
      board.toggleCell(2, 2);

      const beforeCells = board.getAllAliveCells().map(c => `${c.x},${c.y}`).sort();

      engine.nextGeneration();

      const afterCells = board.getAllAliveCells().map(c => `${c.x},${c.y}`).sort();

      // Block should remain stable
      expect(afterCells).toEqual(beforeCells);
    });
  });

  describe('loadPattern', () => {
    it('should load a pattern at specified position', () => {
      const glider = [
        [false, true, false],
        [false, false, true],
        [true, true, true]
      ];

      engine.loadPattern(glider, 5, 5);

      const cells = board.getAllAliveCells();
      expect(cells).toHaveLength(5);

      // Check pattern is placed at correct position
      const hasCell = (x: number, y: number) =>
        cells.some(c => c.x === x && c.y === y);

      expect(hasCell(6, 5)).toBe(true);  // Top middle
      expect(hasCell(7, 6)).toBe(true);  // Middle right
      expect(hasCell(5, 7)).toBe(true);  // Bottom left
      expect(hasCell(6, 7)).toBe(true);  // Bottom middle
      expect(hasCell(7, 7)).toBe(true);  // Bottom right
    });

    it('should handle empty pattern', () => {
      const emptyPattern: boolean[][] = [];
      engine.loadPattern(emptyPattern, 0, 0);
      expect(board.getAllAliveCells()).toHaveLength(0);
    });

    it('should load pattern at any position', () => {
      const largePattern = [
        [true, true, true],
        [true, true, true],
        [true, true, true]
      ];

      // Load at edge of 10x10 board
      engine.loadPattern(largePattern, 8, 8);

      const cells = board.getAllAliveCells();
      // Pattern will extend beyond board boundaries
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('generateRandomPattern', () => {
    it('should generate cells with approximate density', () => {
      const density = 0.3;
      engine.generateRandomPattern(density);

      const cells = board.getAllAliveCells();
      const totalCells = 10 * 10;
      const expectedCount = totalCells * density;

      // Allow for randomness - check within reasonable range
      expect(cells.length).toBeGreaterThan(expectedCount * 0.5);
      expect(cells.length).toBeLessThan(expectedCount * 1.5);
    });

    it('should generate different patterns on subsequent calls', () => {
      engine.generateRandomPattern(0.3);
      const firstPattern = board.getAllAliveCells().map(c => `${c.x},${c.y}`).sort();

      board.clear();
      engine.generateRandomPattern(0.3);
      const secondPattern = board.getAllAliveCells().map(c => `${c.x},${c.y}`).sort();

      // Patterns should be different (extremely unlikely to be same)
      expect(firstPattern).not.toEqual(secondPattern);
    });

    it('should handle edge densities', () => {
      engine.generateRandomPattern(0);
      expect(board.getAllAliveCells()).toHaveLength(0);

      board.clear();
      engine.generateRandomPattern(1);
      expect(board.getAllAliveCells()).toHaveLength(100);
    });
  });

  describe('Conway rules validation', () => {
    it('should keep cell alive with 2 neighbors', () => {
      board.toggleCell(5, 5); // Center cell
      board.toggleCell(4, 5); // Left neighbor
      board.toggleCell(6, 5); // Right neighbor

      engine.nextGeneration();

      const cells = board.getAllAliveCells();
      const centerAlive = cells.some(c => c.x === 5 && c.y === 5);
      expect(centerAlive).toBe(true);
    });

    it('should keep cell alive with 3 neighbors', () => {
      board.toggleCell(5, 5); // Center cell
      board.toggleCell(4, 5); // Left
      board.toggleCell(6, 5); // Right
      board.toggleCell(5, 4); // Top

      engine.nextGeneration();

      const cells = board.getAllAliveCells();
      const centerAlive = cells.some(c => c.x === 5 && c.y === 5);
      expect(centerAlive).toBe(true);
    });

    it('should kill cell with 1 neighbor (underpopulation)', () => {
      board.toggleCell(5, 5); // Center cell
      board.toggleCell(4, 5); // Only one neighbor

      engine.nextGeneration();

      const cells = board.getAllAliveCells();
      const centerAlive = cells.some(c => c.x === 5 && c.y === 5);
      expect(centerAlive).toBe(false);
    });

    it('should kill cell with 4 neighbors (overpopulation)', () => {
      board.toggleCell(5, 5); // Center cell
      board.toggleCell(4, 5); // Left
      board.toggleCell(6, 5); // Right
      board.toggleCell(5, 4); // Top
      board.toggleCell(5, 6); // Bottom

      engine.nextGeneration();

      const cells = board.getAllAliveCells();
      const centerAlive = cells.some(c => c.x === 5 && c.y === 5);
      expect(centerAlive).toBe(false);
    });

    it('should birth dead cell with exactly 3 neighbors', () => {
      // Three cells around (5,5) but (5,5) is dead
      board.toggleCell(4, 5); // Left
      board.toggleCell(6, 5); // Right
      board.toggleCell(5, 4); // Top

      engine.nextGeneration();

      const cells = board.getAllAliveCells();
      const centerBorn = cells.some(c => c.x === 5 && c.y === 5);
      expect(centerBorn).toBe(true);
    });
  });

  describe('patterns', () => {
    it('should have predefined patterns', () => {
      expect(GameEngine.patterns).toBeDefined();
      expect(GameEngine.patterns.glider).toBeDefined();
      expect(GameEngine.patterns.blinker).toBeDefined();
      expect(GameEngine.patterns.toad).toBeDefined();
      expect(GameEngine.patterns.beacon).toBeDefined();
      expect(GameEngine.patterns.pulsar).toBeDefined();
      // gosperGliderGun might not be implemented yet
    });

    it('should load glider pattern correctly', () => {
      engine.loadPattern(GameEngine.patterns.glider, 0, 0);
      expect(board.getAllAliveCells()).toHaveLength(5);
    });

    it('should load blinker pattern correctly', () => {
      engine.loadPattern(GameEngine.patterns.blinker, 0, 0);
      expect(board.getAllAliveCells()).toHaveLength(3);
    });
  });
});