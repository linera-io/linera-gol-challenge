// Centralized puzzle-related type definitions

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export interface Position {
  x: number;
  y: number;
}

export interface LineraBoard {
  size: number;
  liveCells: Array<Position>;
}

export interface TestPositionCondition {
  TestPosition: {
    position: Position;
    is_live: boolean;
  };
}

export interface TestRectangleCondition {
  TestRectangle: {
    x_range: { start: number; end: number };
    y_range: { start: number; end: number };
    min_live_count: number;
    max_live_count: number;
  };
}

export type Condition = TestPositionCondition | TestRectangleCondition;

export interface Puzzle {
  id: string;
  title: string;
  summary: string;
  difficulty: DifficultyLevel;
  size: number;
  minimalSteps: number;
  maximalSteps: number;
  initialConditions?: Condition[];
  finalConditions?: Condition[];
}

export interface PuzzleMetadata {
  id: string;
  title: string;
  summary: string;
  difficulty: DifficultyLevel;
  size: number;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function formatDifficulty(difficulty: DifficultyLevel): string {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}

export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "EASY":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HARD":
      return "danger";
    default:
      return "default";
  }
}