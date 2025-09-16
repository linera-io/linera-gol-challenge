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
  // Create board and engine with proper dimensions, recreating when dimensions change
  const boardRef = useRef<Board | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize or update board when dimensions change
  if (
    !boardRef.current ||
    boardRef.current.config.width !== options.width ||
    boardRef.current.config.height !== options.height
  ) {
    boardRef.current = new Board({
      width: options.width,
      height: options.height,
      infinite: options.infinite || false,
    });
    engineRef.current = new GameEngine(boardRef.current);
  }

  const board = boardRef.current;
  const engine = engineRef.current;

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
      board.toggleCell(x, y);
      // Save or update state after toggling at generation 0
      if (generation === 0) {
        if (!board.hasInitialState()) {
          board.saveState();
        } else {
          // Replace the current state instead of adding new one
          board.replaceCurrentState();
        }
      }
      updateCells();
    },
    [board, updateCells, generation]
  );

  const next = useCallback(() => {
    if (!engine || !board) return;

    // Only compute new generation if we're at the end of history
    if (board.isAtEndOfHistory()) {
      // Make sure we have an initial state saved
      if (generation === 0 && !board.hasInitialState()) {
        board.saveState(); // Save generation 0 if not already saved
      }

      // Compute next generation
      engine.nextGeneration();
      setGeneration((g) => g + 1);

      // Save the NEW state after computing
      board.saveState();
      updateCells();
    } else if (board.canRedo()) {
      // If we're in the middle of history, just move forward
      board.redo();
      setGeneration((g) => g + 1);
      updateCells();
    }
  }, [engine, board, updateCells, generation]);

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

  const resetToInitial = useCallback(() => {
    // Go back to generation 0 and clear future history
    if (board.hasInitialState()) {
      board.resetToInitialState();
      setGeneration(0);
      updateCells();
    }
  }, [board, updateCells]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const loadPattern = useCallback(
    (pattern: boolean[][], x: number, y: number) => {
      if (!engine || !board) return;
      // Save initial state before loading pattern
      if (!board.hasInitialState()) {
        board.saveState();
      }
      engine.loadPattern(pattern, x, y);
      board.saveState(); // Save the loaded pattern as a new state
      updateCells();
    },
    [engine, board, updateCells]
  );

  const generateRandom = useCallback(
    (density: number = 0.3) => {
      if (!engine || !board) return;
      setIsPlaying(false);
      engine.generateRandomPattern(density);
      board.saveState(); // Save the generated pattern as initial state
      setGeneration(0);
      updateCells();
      forceUpdate({});
    },
    [engine, board, updateCells]
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

  // Reset game when dimensions change
  useEffect(() => {
    if (options.width > 0 && options.height > 0) {
      setGeneration(0);
      setIsPlaying(false);
      updateCells();
    }
  }, [options.width, options.height]);

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
    resetToInitial,
    play,
    pause,
    setSpeed,
    loadPattern,
    generateRandom,
    patterns: GameEngine.patterns,
  };
}
