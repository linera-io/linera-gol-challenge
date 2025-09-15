"use client";

import { useMemo } from "react";
import { Condition } from "@/lib/types/puzzle.types";
import { RECTANGLE_COLORS, getRGBString } from "@/lib/game-of-life/config/colors";
import {
  RectangleInfo,
  getRectangleLabel,
  extractRectangleCondition,
  rectanglesOverlap,
} from "@/lib/game-of-life/utils/rectangle-helpers";

interface RectangleOverlaysProps {
  initialConditions?: Condition[];
  finalConditions?: Condition[];
  cellSize: number;
}

// Create a combined overlay when both conditions have overlapping rectangles
function createCombinedRectangleOverlay(
  initialRect: RectangleInfo,
  finalRect: RectangleInfo,
  cellSize: number
): JSX.Element {
  const width = (initialRect.x_range.end - initialRect.x_range.start) * cellSize;
  const height = (initialRect.y_range.end - initialRect.y_range.start) * cellSize;
  const fontSize = Math.max(11, Math.min(14, Math.min(width, height) / 10));

  return (
    <div
      key="combined-rect"
      className="absolute pointer-events-none flex flex-col items-end justify-end"
      style={{
        left: initialRect.x_range.start * cellSize,
        top: initialRect.y_range.start * cellSize,
        width,
        height,
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 50%, rgba(59, 130, 246, 0.08) 50%)",
        border: "2px solid",
        borderImage: "linear-gradient(135deg, rgba(34, 197, 94, 0.6), rgba(59, 130, 246, 0.6)) 1",
        borderRadius: "6px",
        zIndex: 10,
        padding: "8px",
      }}
    >
      <div className="flex flex-col gap-1">
        <div
          className="font-medium px-2 py-1 rounded"
          style={{
            fontSize: `${fontSize}px`,
            color: "rgb(34, 197, 94)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {getRectangleLabel(initialRect, "initial")}
        </div>
        <div
          className="font-medium px-2 py-1 rounded"
          style={{
            fontSize: `${fontSize}px`,
            color: "rgb(59, 130, 246)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {getRectangleLabel(finalRect, "final")}
        </div>
      </div>
    </div>
  );
}

// Create a single rectangle overlay
function createSingleRectangleOverlay(
  rect: RectangleInfo,
  cellSize: number,
  type: "initial" | "final",
  index: number
): JSX.Element {
  const isInitial = type === "initial";

  // Use different colors for multiple rectangles
  const colorIndex = index % RECTANGLE_COLORS.length;
  const baseColorIndex = isInitial ? 0 : 1; // Green for initial, blue for final
  const effectiveIndex =
    index === 0 ? baseColorIndex : (2 + colorIndex) % RECTANGLE_COLORS.length;
  const colorObj = RECTANGLE_COLORS[effectiveIndex];
  const color = getRGBString(colorObj);

  const width = (rect.x_range.end - rect.x_range.start) * cellSize;
  const height = (rect.y_range.end - rect.y_range.start) * cellSize;
  const fontSize = Math.max(11, Math.min(14, Math.min(width, height) / 10));
  const label = getRectangleLabel(rect, type);

  return (
    <div
      key={`${type}-rect-${index}`}
      className="absolute pointer-events-none flex items-end justify-end"
      style={{
        left: rect.x_range.start * cellSize,
        top: rect.y_range.start * cellSize,
        width,
        height,
        border: `2px dashed rgba(${color}, 0.5)`,
        backgroundColor: `rgba(${color}, 0.06)`,
        borderRadius: "6px",
        zIndex: 10,
        padding: "8px",
      }}
    >
      <div
        className="font-medium px-2 py-1 rounded"
        style={{
          fontSize: `${fontSize}px`,
          color: `rgb(${color})`,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function RectangleOverlays({
  initialConditions,
  finalConditions,
  cellSize,
}: RectangleOverlaysProps) {
  // Build rectangle overlays for area conditions
  const rectangleOverlays = useMemo(() => {
    const overlays: JSX.Element[] = [];

    // Extract rectangle conditions
    const initialRect = extractRectangleCondition(initialConditions);
    const finalRect = extractRectangleCondition(finalConditions);

    // Check if rectangles overlap
    if (rectanglesOverlap(initialRect, finalRect)) {
      // Create combined overlay for overlapping rectangles
      overlays.push(createCombinedRectangleOverlay(initialRect!, finalRect!, cellSize));
    } else {
      // Create separate overlays for non-overlapping rectangles
      if (initialRect) {
        overlays.push(createSingleRectangleOverlay(initialRect, cellSize, "initial", 0));
      }
      if (finalRect) {
        overlays.push(createSingleRectangleOverlay(finalRect, cellSize, "final", 0));
      }
    }

    // Handle multiple rectangle conditions (if there are more than one)
    let rectIndex = 1;
    if (initialConditions) {
      initialConditions.forEach((condition) => {
        if ("TestRectangle" in condition && condition.TestRectangle !== initialRect) {
          overlays.push(
            createSingleRectangleOverlay(condition.TestRectangle, cellSize, "initial", rectIndex++)
          );
        }
      });
    }

    if (finalConditions) {
      finalConditions.forEach((condition) => {
        if ("TestRectangle" in condition && condition.TestRectangle !== finalRect) {
          overlays.push(
            createSingleRectangleOverlay(condition.TestRectangle, cellSize, "final", rectIndex++)
          );
        }
      });
    }

    return overlays;
  }, [initialConditions, finalConditions, cellSize]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {rectangleOverlays}
    </div>
  );
}
