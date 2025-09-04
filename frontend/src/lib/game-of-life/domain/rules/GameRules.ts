export class GameRules {
  static shouldCellLive(isAlive: boolean, aliveNeighbors: number): boolean {
    if (isAlive) {
      return aliveNeighbors === 2 || aliveNeighbors === 3;
    } else {
      return aliveNeighbors === 3;
    }
  }
}