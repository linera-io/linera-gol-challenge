import { GameRules } from '../GameRules';

describe('GameRules', () => {
  describe('shouldCellLive', () => {
    describe('alive cell rules', () => {
      it('should die with 0 neighbors (underpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 0)).toBe(false);
      });

      it('should die with 1 neighbor (underpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 1)).toBe(false);
      });

      it('should survive with 2 neighbors', () => {
        expect(GameRules.shouldCellLive(true, 2)).toBe(true);
      });

      it('should survive with 3 neighbors', () => {
        expect(GameRules.shouldCellLive(true, 3)).toBe(true);
      });

      it('should die with 4 neighbors (overpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 4)).toBe(false);
      });

      it('should die with 5 neighbors (overpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 5)).toBe(false);
      });

      it('should die with 6 neighbors (overpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 6)).toBe(false);
      });

      it('should die with 7 neighbors (overpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 7)).toBe(false);
      });

      it('should die with 8 neighbors (overpopulation)', () => {
        expect(GameRules.shouldCellLive(true, 8)).toBe(false);
      });
    });

    describe('dead cell rules', () => {
      it('should stay dead with 0 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 0)).toBe(false);
      });

      it('should stay dead with 1 neighbor', () => {
        expect(GameRules.shouldCellLive(false, 1)).toBe(false);
      });

      it('should stay dead with 2 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 2)).toBe(false);
      });

      it('should become alive with exactly 3 neighbors (reproduction)', () => {
        expect(GameRules.shouldCellLive(false, 3)).toBe(true);
      });

      it('should stay dead with 4 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 4)).toBe(false);
      });

      it('should stay dead with 5 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 5)).toBe(false);
      });

      it('should stay dead with 6 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 6)).toBe(false);
      });

      it('should stay dead with 7 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 7)).toBe(false);
      });

      it('should stay dead with 8 neighbors', () => {
        expect(GameRules.shouldCellLive(false, 8)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle negative neighbor counts as 0', () => {
        // This shouldn't happen in practice, but let's be defensive
        expect(GameRules.shouldCellLive(true, -1)).toBe(false);
        expect(GameRules.shouldCellLive(false, -1)).toBe(false);
      });

      it('should handle neighbor counts > 8 as overpopulation', () => {
        // This shouldn't happen in a 2D grid, but let's be defensive
        expect(GameRules.shouldCellLive(true, 9)).toBe(false);
        expect(GameRules.shouldCellLive(false, 9)).toBe(false);
        expect(GameRules.shouldCellLive(true, 100)).toBe(false);
        expect(GameRules.shouldCellLive(false, 100)).toBe(false);
      });
    });
  });

  describe('Conway\'s Game of Life rules verification', () => {
    it('should implement rule 1: Any live cell with fewer than two live neighbors dies', () => {
      expect(GameRules.shouldCellLive(true, 0)).toBe(false);
      expect(GameRules.shouldCellLive(true, 1)).toBe(false);
    });

    it('should implement rule 2: Any live cell with two or three live neighbors survives', () => {
      expect(GameRules.shouldCellLive(true, 2)).toBe(true);
      expect(GameRules.shouldCellLive(true, 3)).toBe(true);
    });

    it('should implement rule 3: Any live cell with more than three live neighbors dies', () => {
      expect(GameRules.shouldCellLive(true, 4)).toBe(false);
      expect(GameRules.shouldCellLive(true, 5)).toBe(false);
      expect(GameRules.shouldCellLive(true, 6)).toBe(false);
      expect(GameRules.shouldCellLive(true, 7)).toBe(false);
      expect(GameRules.shouldCellLive(true, 8)).toBe(false);
    });

    it('should implement rule 4: Any dead cell with exactly three live neighbors becomes alive', () => {
      expect(GameRules.shouldCellLive(false, 3)).toBe(true);
      // All other counts should keep it dead
      expect(GameRules.shouldCellLive(false, 0)).toBe(false);
      expect(GameRules.shouldCellLive(false, 1)).toBe(false);
      expect(GameRules.shouldCellLive(false, 2)).toBe(false);
      expect(GameRules.shouldCellLive(false, 4)).toBe(false);
      expect(GameRules.shouldCellLive(false, 5)).toBe(false);
      expect(GameRules.shouldCellLive(false, 6)).toBe(false);
      expect(GameRules.shouldCellLive(false, 7)).toBe(false);
      expect(GameRules.shouldCellLive(false, 8)).toBe(false);
    });
  });

  describe('rule consistency', () => {
    it('should never have the same outcome for alive and dead cells except for 3 neighbors', () => {
      for (let neighbors = 0; neighbors <= 8; neighbors++) {
        const aliveResult = GameRules.shouldCellLive(true, neighbors);
        const deadResult = GameRules.shouldCellLive(false, neighbors);

        if (neighbors === 3) {
          // Both should be alive with 3 neighbors
          expect(aliveResult).toBe(true);
          expect(deadResult).toBe(true);
        } else if (neighbors === 2) {
          // Alive stays alive, dead stays dead
          expect(aliveResult).toBe(true);
          expect(deadResult).toBe(false);
        } else {
          // Both should be dead/stay dead
          expect(aliveResult).toBe(false);
          expect(deadResult).toBe(false);
        }
      }
    });
  });
});