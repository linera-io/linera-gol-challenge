import { Cell } from "./Cell";

export interface BoardConfig {
  width: number;
  height: number;
  infinite?: boolean;
}

export class Board {
  private cells: Map<string, Cell>;
  private history: Map<string, Cell>[] = [];
  private currentHistoryIndex: number = -1;

  constructor(public readonly config: BoardConfig) {
    this.cells = new Map();
  }

  private getCellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  getCell(x: number, y: number): Cell {
    const key = this.getCellKey(x, y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Cell(x, y, false));
    }
    return this.cells.get(key)!;
  }

  setCell(x: number, y: number, alive: boolean): void {
    const cell = this.getCell(x, y);
    cell.setAlive(alive);
  }

  toggleCell(x: number, y: number): void {
    const cell = this.getCell(x, y);
    cell.toggle();
  }

  getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (!this.config.infinite) {
          if (nx < 0 || nx >= this.config.width || ny < 0 || ny >= this.config.height) {
            continue;
          }
        }

        neighbors.push(this.getCell(nx, ny));
      }
    }
    return neighbors;
  }

  countAliveNeighbors(x: number, y: number): number {
    return this.getNeighbors(x, y).filter((cell) => cell.alive).length;
  }

  getAllAliveCells(): Cell[] {
    return Array.from(this.cells.values()).filter((cell) => cell.alive);
  }

  clear(): void {
    this.cells.clear();
    this.history = [];
    this.currentHistoryIndex = -1;
  }

  saveState(): void {
    const state = new Map<string, Cell>();
    this.cells.forEach((cell, key) => {
      if (cell.alive) {
        state.set(key, new Cell(cell.x, cell.y, true));
      }
    });

    this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    this.history.push(state);
    this.currentHistoryIndex++;
  }

  replaceCurrentState(): void {
    const state = new Map<string, Cell>();
    this.cells.forEach((cell, key) => {
      if (cell.alive) {
        state.set(key, new Cell(cell.x, cell.y, true));
      }
    });

    if (this.currentHistoryIndex >= 0 && this.currentHistoryIndex < this.history.length) {
      this.history[this.currentHistoryIndex] = state;
    } else {
      this.saveState();
    }
  }

  canUndo(): boolean {
    return this.currentHistoryIndex > 0;
  }

  canRedo(): boolean {
    return this.currentHistoryIndex < this.history.length - 1;
  }

  hasInitialState(): boolean {
    return this.currentHistoryIndex > -1;
  }

  isAtEndOfHistory(): boolean {
    return this.currentHistoryIndex === this.history.length - 1;
  }

  undo(): void {
    if (!this.canUndo()) return;

    this.currentHistoryIndex--;
    this.restoreState(this.history[this.currentHistoryIndex]);
  }

  redo(): void {
    if (!this.canRedo()) return;

    this.currentHistoryIndex++;
    this.restoreState(this.history[this.currentHistoryIndex]);
  }

  private restoreState(state: Map<string, Cell>): void {
    this.cells.clear();
    state.forEach((cell, key) => {
      this.cells.set(key, new Cell(cell.x, cell.y, cell.alive));
    });
  }

  getActiveBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    const aliveCells = this.getAllAliveCells();
    if (aliveCells.length === 0) return null;

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    aliveCells.forEach((cell) => {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    });

    return { minX, minY, maxX, maxY };
  }
}
