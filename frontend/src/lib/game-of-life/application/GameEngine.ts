import { Board } from '../domain/entities/Board';
import { GameRules } from '../domain/rules/GameRules';

export class GameEngine {
  constructor(private board: Board) {}

  nextGeneration(): void {
    const nextState = new Map<string, boolean>();
    const cellsToCheck = new Set<string>();

    // Only process alive cells and their neighbors
    const aliveCells = this.board.getAllAliveCells();
    
    // Use batch processing for better performance
    const coordsToCheck: [number, number][] = [];
    
    aliveCells.forEach(cell => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cell.x + dx},${cell.y + dy}`;
          if (!cellsToCheck.has(key)) {
            cellsToCheck.add(key);
            coordsToCheck.push([cell.x + dx, cell.y + dy]);
          }
        }
      }
    });

    // Process in batches for better performance
    coordsToCheck.forEach(([x, y]) => {
      const cell = this.board.getCell(x, y);
      const aliveNeighbors = this.board.countAliveNeighbors(x, y);
      const shouldLive = GameRules.shouldCellLive(cell.alive, aliveNeighbors);
      
      if (shouldLive) {
        nextState.set(`${x},${y}`, true);
      }
    });

    // Clear all cells first
    aliveCells.forEach(cell => {
      this.board.setCell(cell.x, cell.y, false);
    });

    // Then set only the alive ones
    nextState.forEach((_, key) => {
      const [x, y] = key.split(',').map(Number);
      this.board.setCell(x, y, true);
    });
  }

  loadPattern(pattern: boolean[][], offsetX: number = 0, offsetY: number = 0): void {
    pattern.forEach((row, y) => {
      row.forEach((alive, x) => {
        if (alive) {
          this.board.setCell(x + offsetX, y + offsetY, true);
        }
      });
    });
  }

  generateRandomPattern(density: number = 0.3): void {
    const width = this.board.config.width;
    const height = this.board.config.height;
    
    // Clear all existing cells
    const aliveCells = this.board.getAllAliveCells();
    aliveCells.forEach(cell => {
      this.board.setCell(cell.x, cell.y, false);
    });
    
    // Generate random cells based on density
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < density) {
          this.board.setCell(x, y, true);
        }
      }
    }
  }

  // we don't use this anymore but maybe we will in the future
  static patterns = {
    glider: [
      [false, true, false],
      [false, false, true],
      [true, true, true]
    ],
    blinker: [
      [true],
      [true],
      [true]
    ],
    beacon: [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, true, true],
      [false, false, true, true]
    ],
    toad: [
      [false, true, true, true],
      [true, true, true, false]
    ],
    pulsar: [
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [false, false, true, true, true, false, false, false, true, true, true, false, false],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [true, false, false, false, false, true, false, true, false, false, false, false, true],
      [false, false, false, false, false, false, false, false, false, false, false, false, false],
      [false, false, true, true, true, false, false, false, true, true, true, false, false]
    ]
  };
}