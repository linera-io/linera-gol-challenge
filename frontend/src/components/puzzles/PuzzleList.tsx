import { Card, CardBody } from "@heroui/card";
import { KNOWN_PUZZLES, PuzzleMetadata } from "@/lib/game-of-life/data/puzzles";
import { useCompletedPuzzles } from "@/lib/game-of-life/hooks/useCompletedPuzzles";
import { PuzzleCard } from "./PuzzleCard";

interface PuzzleListProps {
  onSelectPuzzle: (puzzleId: string) => void;
  currentPuzzleId?: string;
}

const difficultyConfig = {
  Easy: {
    icon: "🌱",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  Medium: {
    icon: "🔥",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  Hard: {
    icon: "💀",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
};

export function PuzzleList({
  onSelectPuzzle,
  currentPuzzleId,
}: PuzzleListProps) {
  const { isPuzzleCompleted, isLoadingFromBlockchain } = useCompletedPuzzles();
  
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
    <div className="space-y-2 sm:space-y-3">
      {Object.entries(groupedPuzzles).map(([difficulty, puzzles]) => {
        const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];

        return (
          <div key={difficulty} className="space-y-1.5 sm:space-y-2">
            {puzzles.map((puzzle) => (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                isSelected={currentPuzzleId === puzzle.id}
                isCompleted={isPuzzleCompleted(puzzle.id)}
                isLoading={isLoadingFromBlockchain}
                onSelect={() => onSelectPuzzle(puzzle.id)}
                difficulty={difficulty as "Easy" | "Medium" | "Hard"}
                difficultyConfig={config}
              />
            ))}
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
