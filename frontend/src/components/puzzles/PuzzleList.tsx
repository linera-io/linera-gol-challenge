import { Card, CardBody } from "@heroui/card";
import { Badge } from "@heroui/badge";
import { KNOWN_PUZZLES, PuzzleMetadata } from "@/lib/game-of-life/data/puzzles";
import { ChevronRight } from "lucide-react";

interface PuzzleListProps {
  onSelectPuzzle: (puzzleId: string) => void;
  currentPuzzleId?: string;
}

const difficultyConfig = {
  Easy: {
    color: "success" as const,
    icon: "🌱",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  Medium: {
    color: "warning" as const,
    icon: "🔥",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  Hard: {
    color: "danger" as const,
    icon: "💀",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
};

export function PuzzleList({
  onSelectPuzzle,
  currentPuzzleId,
}: PuzzleListProps) {
  const groupedPuzzles = KNOWN_PUZZLES.reduce(
    (acc, puzzle) => {
      if (!acc[puzzle.difficulty]) {
        acc[puzzle.difficulty] = [];
      }
      acc[puzzle.difficulty].push(puzzle);
      return acc;
    },
    {} as Record<string, PuzzleMetadata[]>
  );

  return (
    <div className="space-y-3">
      {Object.entries(groupedPuzzles).map(([difficulty, puzzles]) => {
        const config =
          difficultyConfig[difficulty as keyof typeof difficultyConfig];

        return (
          <div key={difficulty} className="space-y-2">
            {puzzles.map((puzzle) => {
              const isSelected = currentPuzzleId === puzzle.id;

              return (
                <Card
                  key={puzzle.id}
                  isPressable
                  onPress={() => onSelectPuzzle(puzzle.id)}
                  className={`
                    transition-all duration-200 cursor-pointer w-full
                    ${
                      isSelected
                        ? "ring-2 ring-linera-primary shadow-md transform scale-[1.02]"
                        : "hover:shadow-md hover:scale-[1.01]"
                    }
                  `}
                >
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {puzzle.title}
                          </h3>
                          {isSelected && (
                            <Badge color="primary" variant="solid" size="sm">
                              Active
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {puzzle.summary}
                        </p>

                        <div className="flex items-center gap-2">
                          <span
                            className={`
                            px-2 py-0.5 text-xs rounded-full font-medium
                            ${config.bgColor} ${config.textColor}
                          `}
                          >
                            {config.icon} {difficulty}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`
                          w-5 h-5 transition-transform
                          ${isSelected ? "text-linera-primary translate-x-1" : "text-gray-400"}
                        `}
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        );
      })}

      {KNOWN_PUZZLES.length === 0 && (
        <Card className="bg-gray-50">
          <CardBody className="text-center py-8">
            <p className="text-gray-600">No puzzles available</p>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for new challenges!
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
