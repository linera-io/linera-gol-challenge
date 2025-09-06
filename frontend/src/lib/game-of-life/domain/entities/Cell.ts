export class Cell {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public alive: boolean = false
  ) {}

  toggle(): void {
    this.alive = !this.alive;
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
  }
}