"use client";

import { GameBoard } from "./GameBoard";
import { GameBoardCanvas } from "./GameBoardCanvas";

interface GameBoardWrapperProps {
  width: number;
  height: number;
  cells: Map<string, boolean>;
  onCellClick: (x: number, y: number) => void;
  cellSize?: number;
}

const CANVAS_THRESHOLD = 50;

export function GameBoardWrapper(props: GameBoardWrapperProps) {
  const { width, height } = props;
  const shouldUseCanvas = width > CANVAS_THRESHOLD || height > CANVAS_THRESHOLD;

  if (shouldUseCanvas) {
    return <GameBoardCanvas {...props} />;
  }

  return <GameBoard {...props} />;
}
