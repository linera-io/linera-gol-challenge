import { Card, CardBody } from "@heroui/card";
import { Badge } from "@heroui/badge";
import { ChevronRight, CheckCircle } from "lucide-react";
import { PuzzleMetadata } from "@/lib/game-of-life/data/puzzles";

interface PuzzleCardProps {
  puzzle: PuzzleMetadata;
  isSelected: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  onSelect: () => void;
  difficulty: "Easy" | "Medium" | "Hard";
  difficultyConfig: {
    icon: string;
    bgColor: string;
    textColor: string;
  };
}

export function PuzzleCard({
  puzzle,
  isSelected,
  isCompleted,
  isLoading,
  onSelect,
  difficulty,
  difficultyConfig,
}: PuzzleCardProps) {
  return (
    <Card
      isPressable
      onPress={onSelect}
      className={`
        transition-all duration-200 cursor-pointer w-full
        ${
          isSelected
            ? "ring-2 ring-linera-primary shadow-md transform scale-[1.02]"
            : isCompleted && !isLoading
            ? "bg-green-50/50 hover:shadow-md hover:scale-[1.01]"
            : "hover:shadow-md hover:scale-[1.01]"
        }
      `}
    >
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {puzzle.title}
              </h3>
              
              <div className="flex items-center gap-1.5">
                {isSelected && (
                  <Badge color="primary" variant="solid" size="sm">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Summary - hidden on very small screens */}
            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
              {puzzle.summary}
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-flex items-center gap-1
                  px-1.5 sm:px-2 py-0.5 text-xs rounded-full font-medium
                  ${difficultyConfig.bgColor} ${difficultyConfig.textColor}
                `}
              >
                <span className="text-xs sm:text-sm">{difficultyConfig.icon}</span>
                <span>{difficulty}</span>
              </span>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              isCompleted && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              )
            )}
            <ChevronRight
              className={`
                w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0
                ${isSelected ? "text-linera-primary translate-x-0.5 sm:translate-x-1" : "text-gray-400"}
              `}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}