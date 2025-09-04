"use client";

import { useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";

interface GameBoardProps {
  width: number;
  height: number;
  cells: Map<string, boolean>;
  onCellClick: (x: number, y: number) => void;
  cellSize?: number;
}

export const GameBoard = memo(function GameBoard({
  width,
  height,
  cells,
  onCellClick,
  cellSize = 20,
}: GameBoardProps) {
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      onCellClick(x, y);
    },
    [onCellClick]
  );

  const grid = useMemo(() => {
    const result = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        const isAlive = cells.has(key);
        result.push(
          <motion.div
            key={key}
            className={`
              border border-gray-200 cursor-pointer
              transition-all duration-150
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
          />
        );
      }
    }
    return result;
  }, [width, height, cells, cellSize, handleCellClick]);

  return (
    <div
      className="inline-grid gap-0 bg-gray-100 p-2 rounded"
      style={{
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
      }}
    >
      {grid}
    </div>
  );
});
