import { Condition } from "@/lib/types/puzzle.types";

export interface RectangleInfo {
  x_range: { start: number; end: number };
  y_range: { start: number; end: number };
  min_live_count: number;
  max_live_count: number;
}

// Helper to get user-friendly text for rectangle constraints
export function getRectangleLabel(rect: RectangleInfo, type: "initial" | "final"): string {
  const minCells = rect.min_live_count;
  const maxCells = rect.max_live_count;
  const prefix = type === "initial" ? "Start with" : "End with";

  if (minCells === maxCells) {
    return `${prefix} ${minCells} cell${minCells !== 1 ? "s" : ""} here`;
  }
  return `${prefix} ${minCells}-${maxCells} cells here`;
}

// Helper function to extract rectangle conditions
export function extractRectangleCondition(
  conditions: Condition[] | undefined
): RectangleInfo | null {
  if (!conditions) return null;

  for (const condition of conditions) {
    if ("TestRectangle" in condition) {
      return condition.TestRectangle;
    }
  }
  return null;
}

// Helper function to check if two rectangles cover the same area
export function rectanglesOverlap(
  rect1: RectangleInfo | null,
  rect2: RectangleInfo | null
): boolean {
  if (!rect1 || !rect2) return false;

  return (
    rect1.x_range.start === rect2.x_range.start &&
    rect1.x_range.end === rect2.x_range.end &&
    rect1.y_range.start === rect2.y_range.start &&
    rect1.y_range.end === rect2.y_range.end
  );
}