import { DifficultyLevel, formatDifficulty } from "@/lib/types/puzzle.types";
import { difficultyConfig } from "@/lib/game-of-life/config/difficulty-config";

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function DifficultyBadge({
  difficulty,
  size = "md",
  showText = true
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs gap-1",
    md: "px-2 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  const iconSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        border
      `}
    >
      <span className={iconSizeClasses[size]}>{config.icon}</span>
      {showText && <span>{formatDifficulty(difficulty)}</span>}
    </span>
  );
}