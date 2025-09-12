import { Card, CardBody } from "@heroui/card";
import { Grid3x3, Trophy } from "lucide-react";
import { PuzzleList } from "./PuzzleList";
import { useCompletedPuzzles } from "@/lib/game-of-life/hooks/useCompletedPuzzles";
import { KNOWN_PUZZLES } from "@/lib/game-of-life/data/puzzles";

interface PuzzleSelectionViewProps {
  onSelectPuzzle: (puzzleId: string) => void;
  currentPuzzleId?: string;
}

export function PuzzleSelectionView({ 
  onSelectPuzzle, 
  currentPuzzleId 
}: PuzzleSelectionViewProps) {
  const { getCompletionCount, isLoadingFromBlockchain } = useCompletedPuzzles();
  const completedCount = getCompletionCount();
  const totalCount = KNOWN_PUZZLES.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Choose Your Challenge
        </h2>
        {isLoadingFromBlockchain ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          completedCount > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <span className="font-medium text-gray-700">
                {completedCount}/{totalCount}
                <span className="hidden sm:inline"> Completed</span>
              </span>
              <span className="text-gray-500">({completionPercentage}%)</span>
            </div>
          )
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <PuzzleList
            onSelectPuzzle={onSelectPuzzle}
            currentPuzzleId={currentPuzzleId}
          />
        </div>
        <div className="lg:col-span-2 hidden sm:block">
          <Card className="bg-white shadow-lg h-full">
            <CardBody className="flex items-center justify-center">
              <div className="text-center">
                {isLoadingFromBlockchain ? (
                  <>
                    <div className="h-16 w-16 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
                    <div className="h-7 w-48 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                    <div className="h-5 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
                    <div className="mt-4">
                      <div className="w-48 mx-auto bg-gray-200 rounded-full h-2 animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded mx-auto mt-2 animate-pulse" />
                    </div>
                  </>
                ) : completedCount === totalCount && totalCount > 0 ? (
                  <>
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-sm">
                      You've completed all available puzzles! Check back later for new challenges.
                    </p>
                  </>
                ) : (
                  <>
                    <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                      Ready to Start?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-sm">
                      Select a puzzle from the list to begin your challenge
                    </p>
                    {completedCount > 0 && (
                      <div className="mt-4">
                        <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Progress: {completedCount} of {totalCount} puzzles completed
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}