import { DifficultyLevel } from "@/lib/types/puzzle.types";

export const difficultyConfig: Record<
  DifficultyLevel,
  {
    icon: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  EASY: {
    icon: "🌱",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  MEDIUM: {
    icon: "🔥",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  HARD: {
    icon: "💀",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};