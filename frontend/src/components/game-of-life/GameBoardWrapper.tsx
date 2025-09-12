"use client";

import { GameBoard } from "./GameBoard";
import { GameBoardCanvas } from "./GameBoardCanvas";
import { Condition } from "@/lib/types/puzzle.types";
import { BOARD_CONFIG } from "@/lib/game-of-life/config/board-config";

interface GameBoardWrapperProps {
  width: number;
  height: number;
  cells: Map<string, boolean>;
  onCellClick: (x: number, y: number) => void;
  cellSize?: number;
  initialConditions?: Condition[];
  finalConditions?: Condition[];
}

export function GameBoardWrapper(props: GameBoardWrapperProps) {
  const { width, height } = props;
  const shouldUseCanvas =
    width > BOARD_CONFIG.CANVAS_THRESHOLD || height > BOARD_CONFIG.CANVAS_THRESHOLD;

  if (shouldUseCanvas) {
    return <GameBoardCanvas {...props} />;
  }

  return <GameBoard {...props} />;
}
