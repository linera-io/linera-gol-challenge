"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import { Condition } from "@/lib/types/puzzle.types";
import { BOARD_CONFIG } from "@/lib/game-of-life/config/board-config";
import { RectangleOverlays } from "./RectangleOverlays";

interface GameBoardCanvasProps {
  width: number;
  height: number;
  cells: Map<string, boolean>;
  onCellClick: (x: number, y: number) => void;
  cellSize?: number;
  initialConditions?: Condition[];
  finalConditions?: Condition[];
}

export const GameBoardCanvas = memo(function GameBoardCanvas({
  width,
  height,
  cells,
  onCellClick,
  cellSize = 20,
  initialConditions,
  finalConditions,
}: GameBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adjust grid line width based on cell size for better visibility
    const lineWidth = cellSize < 15 ? 0.5 : 1;

    // Light gray grid lines
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = lineWidth;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
      ctx.stroke();
    }

    // Draw condition overlays
    if (initialConditions || finalConditions) {
      ctx.save();

      // Draw initial conditions
      if (initialConditions) {
        initialConditions.forEach((condition) => {
          if ("TestPosition" in condition) {
            const { position, is_live } = condition.TestPosition;
            if (position.x >= 0 && position.x < width && position.y >= 0 && position.y < height) {
              ctx.fillStyle = is_live
                ? "rgba(34, 197, 94, 0.3)" // Green for must be alive
                : "rgba(34, 197, 94, 0.15)"; // Lighter green for must be dead
              ctx.fillRect(
                position.x * cellSize + 1,
                position.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
              );
            }
          }
        });
      }

      // Draw final conditions
      if (finalConditions) {
        finalConditions.forEach((condition) => {
          if ("TestPosition" in condition) {
            const { position, is_live } = condition.TestPosition;
            if (position.x >= 0 && position.x < width && position.y >= 0 && position.y < height) {
              ctx.fillStyle = is_live
                ? "rgba(59, 130, 246, 0.3)" // Blue for must be alive
                : "rgba(59, 130, 246, 0.15)"; // Lighter blue for must be dead
              ctx.fillRect(
                position.x * cellSize + 1,
                position.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
              );
            }
          }
        });
      }

      ctx.restore();
    }

    // Linera primary color for alive cells
    ctx.fillStyle = BOARD_CONFIG.CELL_COLOR;

    // Adjust shadow based on cell size for better performance and visibility
    if (cellSize > 15) {
      ctx.shadowColor = "rgba(222, 42, 2, 0.2)";
      ctx.shadowBlur = 4;
    } else {
      // Disable shadow for small cells to improve performance
      ctx.shadowBlur = 0;
    }

    cells.forEach((_, key) => {
      const [x, y] = key.split(",").map(Number);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    });

    ctx.shadowBlur = 0;
  }, [width, height, cells, cellSize, initialConditions, finalConditions]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);

      if (x >= 0 && x < width && y >= 0 && y < height) {
        onCellClick(x, y);
      }
    },
    [cellSize, width, height, onCellClick]
  );

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={width * cellSize}
        height={height * cellSize}
        className="cursor-pointer rounded-lg border border-gray-200"
        onClick={handleCanvasClick}
        style={{
          imageRendering: "pixelated",
          backgroundColor: "#FFFFFF",
        }}
      />
      <RectangleOverlays
        initialConditions={initialConditions}
        finalConditions={finalConditions}
        cellSize={cellSize}
      />
    </div>
  );
});
