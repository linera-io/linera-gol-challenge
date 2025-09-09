import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { CheckCircle, AlertCircle, Target } from "lucide-react";
import { PuzzleInfo as PuzzleData } from "@/lib/game-of-life/hooks/usePuzzleGame";

interface PuzzleInfoProps {
  puzzle: PuzzleData | null;
  generation: number;
  validationResult: { isValid: boolean; message?: string } | null;
  isValidating: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClear: () => void;
}

export function PuzzleInfo({
  puzzle,
  generation,
  validationResult,
  isSubmitting,
  onSubmit,
}: PuzzleInfoProps) {
  if (!puzzle) {
    return (
      <Card className="bg-white shadow-lg">
        <CardBody className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Select a puzzle to begin</p>
        </CardBody>
      </Card>
    );
  }

  const canValidate = generation === 0;
  // Ensure we have a valid difficulty, default to Easy
  const difficulty = puzzle.difficulty || "Easy";
  console.log("[GOL] Difficulty:", difficulty);

  return (
    <div className="space-y-4">
      {/* Puzzle Header Card */}
      <Card className="bg-white shadow-lg">
        <CardBody className="p-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {puzzle.title}
              </h3>
              <Chip 
                variant="flat" 
                size="sm"
                className={
                  difficulty === "Easy" 
                    ? "bg-green-100 text-green-700" 
                    : difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }
              >
                Difficulty {difficulty}
              </Chip>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {puzzle.summary}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Game Progress Card */}
      <Card className="bg-white shadow-lg">
        <CardBody className="p-6">
          <div className="space-y-4">
            {/* Current Generation Display */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">
                Current generation
              </span>
              <span className="text-2xl font-bold text-linera-primary">
                {generation}
              </span>
            </div>

            {/* Instructions */}
            {generation !== 0 && (
              <p className="text-sm text-gray-500">
                Reset to generation 0 before submitting your solution.
              </p>
            )}

            {generation === 0 && !validationResult && (
              <p className="text-sm text-gray-500">
                Place your cells and press submit when ready.
              </p>
            )}

            {/* Validation Result */}
            {validationResult && (
              <div
                className={`p-4 rounded-lg border ${
                  validationResult.isValid
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        validationResult.isValid
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {validationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onPress={onSubmit}
              isLoading={isSubmitting}
              isDisabled={!canValidate}
              className="w-full font-medium bg-linera-primary hover:bg-linera-primary-dark text-white"
              size="lg"
            >
              Submit Solution
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
