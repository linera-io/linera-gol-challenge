import { useState, useCallback, useRef, useEffect } from "react";
import { Board } from "../domain/entities/Board";
import { GameEngine } from "../application/GameEngine";

export interface UseGameOfLifeOptions {
  width: number;
  height: number;
  infinite?: boolean;
  initialSpeed?: number;
}

export function useGameOfLife(options: UseGameOfLifeOptions) {
  const [board] = useState(
    () =>
      new Board({
        width: options.width,
        height: options.height,
        infinite: options.infinite || false,
      })
  );

  const [engine] = useState(() => new GameEngine(board));
  const [generation, setGeneration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(options.initialSpeed || 100);
  const [cells, setCells] = useState<Map<string, boolean>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, forceUpdate] = useState({});

  const updateCells = useCallback(() => {
    const aliveCells = board.getAllAliveCells();
    const newCells = new Map<string, boolean>();
    aliveCells.forEach((cell) => {
      newCells.set(`${cell.x},${cell.y}`, true);
    });
    setCells(new Map(newCells));
  }, [board]);

  const toggleCell = useCallback(
    (x: number, y: number) => {
      // Save initial state before first cell placement at generation 0
      if (generation === 0 && !board.hasInitialState()) {
        board.saveState();
      }
      board.toggleCell(x, y);
      updateCells();
    },
    [board, generation, updateCells]
  );

  const next = useCallback(() => {
    engine.nextGeneration();
    setGeneration((g) => g + 1);
    updateCells();
  }, [engine, updateCells]);

  const previous = useCallback(() => {
    if (board.canUndo()) {
      board.undo();
      setGeneration((g) => Math.max(0, g - 1));
      updateCells();
    }
  }, [board, updateCells]);

  const clear = useCallback(() => {
    board.clear();
    setGeneration(0);
    updateCells();
  }, [board, updateCells]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const loadPattern = useCallback(
    (pattern: boolean[][], x: number, y: number) => {
      engine.loadPattern(pattern, x, y);
      updateCells();
    },
    [engine, updateCells]
  );

  const generateRandom = useCallback(
    (density: number = 0.3) => {
      setIsPlaying(false);
      engine.generateRandomPattern(density);
      setGeneration(0);
      updateCells();
      forceUpdate({});
    },
    [engine, updateCells]
  );

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(next, 1000 / speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, next]);

  useEffect(() => {
    updateCells();
  }, []);

  return {
    cells,
    generation,
    isPlaying,
    speed,
    canUndo: board.canUndo(),
    canRedo: board.canRedo(),
    toggleCell,
    next,
    previous,
    clear,
    play,
    pause,
    setSpeed,
    loadPattern,
    generateRandom,
    patterns: GameEngine.patterns,
  };
}
