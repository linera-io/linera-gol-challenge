import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { CheckCircle, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Puzzle } from "@/lib/types/puzzle.types";

interface PuzzleSubmitProps {
  puzzle: Puzzle | null;
  generation: number;
  validationResult: { isValid: boolean; message?: string } | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function PuzzleSubmit({ puzzle, generation, validationResult, isSubmitting, onSubmit }: PuzzleSubmitProps) {
  const hasStepRequirement = puzzle?.minimalSteps !== undefined && puzzle?.maximalSteps !== undefined;
  const hasConditions = !!(
    (puzzle?.initialConditions && puzzle.initialConditions.length > 0) ||
    (puzzle?.finalConditions && puzzle.finalConditions.length > 0)
  );
  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-4">
          {hasStepRequirement && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-gray-700 font-medium">
                  {puzzle?.minimalSteps === puzzle?.maximalSteps
                    ? `Reach goal pattern in exactly ${puzzle.minimalSteps} generation${puzzle.minimalSteps !== 1 ? "s" : ""}`
                    : `Reach goal pattern in ${puzzle?.minimalSteps}-${puzzle?.maximalSteps} generations`}
                </span>
              </div>
              <span className="text-2xl font-bold text-linera-primary">{generation}</span>
            </div>
          )}

          {hasConditions ? (
            <div className="text-sm text-gray-600 space-y-2">
              <p>Place cells on the grid, experiment, and submit your solution when you believe that:</p>
              <ol className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">1)</span>
                  <span>
                    the current shape satisfies all the initial conditions{" "}
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 align-middle">
                      <Lightbulb size={14} className="text-gray-600" />
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">2)</span>
                  <span>
                    after {hasStepRequirement
                      ? (puzzle?.minimalSteps === puzzle?.maximalSteps
                        ? `${puzzle.minimalSteps} generation${puzzle.minimalSteps !== 1 ? "s" : ""}`
                        : `${puzzle?.minimalSteps}-${puzzle?.maximalSteps} generations`)
                      : "N generations"
                    }, the result will satisfy all the final conditions{" "}
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 align-middle">
                      <Target size={14} className="text-gray-600" />
                    </span>
                  </span>
                </li>
              </ol>
            </div>
          ) : generation !== 0 ? (
            <p className="text-sm text-gray-500">
              Reset to generation 0 before submitting your solution.
            </p>
          ) : (
            <p className="text-sm text-gray-500">Place your cells and press submit when ready.</p>
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
                      validationResult.isValid ? "text-green-800" : "text-red-800"
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
            className="w-full font-medium bg-linera-primary hover:bg-linera-primary-dark text-white"
            size="lg"
          >
            Submit Solution
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}