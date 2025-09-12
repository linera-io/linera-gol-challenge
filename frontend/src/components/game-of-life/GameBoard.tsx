"use client";

import React, { useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Condition } from "@/lib/types/puzzle.types";
import { RectangleOverlays } from "./RectangleOverlays";

interface GameBoardProps {
  width: number;
  height: number;
  cells: Map<string, boolean>;
  onCellClick: (x: number, y: number) => void;
  cellSize?: number;
  initialConditions?: Condition[];
  finalConditions?: Condition[];
}

// Build overlay for individual cell conditions
function buildCellOverlay(overlays: { initial?: boolean; final?: boolean }): JSX.Element | null {
  if (overlays.initial === undefined && overlays.final === undefined) {
    return null;
  }

  const overlayStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    borderRadius: "2px",
  };

  if (overlays.initial !== undefined && overlays.final !== undefined) {
    // Both conditions - show split overlay
    overlayStyles.background = `linear-gradient(135deg, 
      ${overlays.initial ? "rgba(34, 197, 94, 0.25)" : "rgba(34, 197, 94, 0.1)"} 50%, 
      ${overlays.final ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.1)"} 50%)`;
  } else if (overlays.initial !== undefined) {
    // Initial condition only
    overlayStyles.backgroundColor = overlays.initial
      ? "rgba(34, 197, 94, 0.25)" // Green for must be alive
      : "rgba(34, 197, 94, 0.08)"; // Lighter green for must be dead
    if (!overlays.initial) {
      overlayStyles.backgroundImage =
        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(34, 197, 94, 0.15) 3px, rgba(34, 197, 94, 0.15) 6px)";
    }
  } else if (overlays.final !== undefined) {
    // Final condition only
    overlayStyles.backgroundColor = overlays.final
      ? "rgba(59, 130, 246, 0.25)" // Blue for must be alive
      : "rgba(59, 130, 246, 0.08)"; // Lighter blue for must be dead
    if (!overlays.final) {
      overlayStyles.backgroundImage =
        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(59, 130, 246, 0.15) 3px, rgba(59, 130, 246, 0.15) 6px)";
    }
  }

  return <div style={overlayStyles} />;
}

export const GameBoard = memo(function GameBoard({
  width,
  height,
  cells,
  onCellClick,
  cellSize = 20,
  initialConditions,
  finalConditions,
}: GameBoardProps) {
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      onCellClick(x, y);
    },
    [onCellClick]
  );

  // Helper function to check if a cell has conditions
  const getCellOverlay = useCallback(
    (x: number, y: number) => {
      const overlays: { initial?: boolean; final?: boolean } = {};

      // Check initial conditions
      if (initialConditions) {
        for (const condition of initialConditions) {
          if ("TestPosition" in condition) {
            const { position, is_live } = condition.TestPosition;
            if (position.x === x && position.y === y) {
              overlays.initial = is_live;
            }
          }
        }
      }

      // Check final conditions
      if (finalConditions) {
        for (const condition of finalConditions) {
          if ("TestPosition" in condition) {
            const { position, is_live } = condition.TestPosition;
            if (position.x === x && position.y === y) {
              overlays.final = is_live;
            }
          }
        }
      }

      return overlays;
    },
    [initialConditions, finalConditions]
  );

  // Build the grid of cells
  const grid = useMemo(() => {
    const result = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        const isAlive = cells.has(key);
        const overlays = getCellOverlay(x, y);
        const overlayElement = buildCellOverlay(overlays);

        result.push(
          <motion.div
            key={key}
            className={`
              border border-gray-200 cursor-pointer
              transition-all duration-150 relative
              ${isAlive ? "bg-linera-primary shadow-md" : "bg-white hover:bg-gray-50"}
            `}
            style={{
              width: cellSize,
              height: cellSize,
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
            onClick={() => handleCellClick(x, y)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isAlive ? "#DE2A02" : "#FFFFFF",
              boxShadow: isAlive ? "0 4px 6px rgba(222, 42, 2, 0.2)" : "none",
            }}
            transition={{ duration: 0.15 }}
          >
            {overlayElement}
          </motion.div>
        );
      }
    }
    return result;
  }, [width, height, cells, cellSize, handleCellClick, getCellOverlay]);


  return (
    <div className="relative inline-block bg-gray-100 p-2 rounded">
      <div className="relative">
        <div
          className="inline-grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          }}
        >
          {grid}
        </div>
        <RectangleOverlays
          initialConditions={initialConditions}
          finalConditions={finalConditions}
          cellSize={cellSize}
        />
      </div>
    </div>
  );
});
