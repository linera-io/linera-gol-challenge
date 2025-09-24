import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { CheckCircle, AlertCircle, Lightbulb, Target, TriangleAlert } from "lucide-react";
import { Puzzle } from "@/lib/types/puzzle.types";

interface PuzzleSubmitProps {
  puzzle: Puzzle | null;
  generation: number;
  validationResult: { isValid: boolean; message?: string } | null;
  isSubmitting: boolean;
  isPuzzleCompleted?: boolean;
  onSubmit: () => void;
}

function CompletedMessage() {
  return (
    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-green-800">Puzzle already completed!</p>
          <p className="text-sm text-green-700 mt-1">
            You've already solved this puzzle. Try another one!
          </p>
        </div>
      </div>
    </div>
  );
}

function PuzzleInstructions({ puzzle }: { puzzle: Puzzle }) {
  const hasStepRequirement = puzzle.minimalSteps !== undefined && puzzle.maximalSteps !== undefined;

  const generationText = hasStepRequirement
    ? puzzle.minimalSteps === puzzle.maximalSteps
      ? `at generation ${puzzle.minimalSteps}`
      : `between generation ${puzzle.minimalSteps} and ${puzzle.maximalSteps}`
    : "N&nbsp;generations";

  return (
    <div className="text-sm text-gray-600 space-y-2">
      <div className="flex items-start gap-2">
        <Lightbulb size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
        <span>Use the hints to position cells at generation 0.</span>
      </div>
      { puzzle.enforceInitialConditions ?
        <div className="flex items-start gap-2">
          <TriangleAlert size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="font-semibold text-red-600">In this puzzle, hints must be followed for a solution to be valid.</span>
        </div> : <span></span>
      }
      <div className="flex items-start gap-2">
        <Target size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
        <span>
          Submit your solution when the goal is satisfied{" "}
          <span className="font-semibold text-red-600">{generationText}</span>.
        </span>
      </div>
      { puzzle.isStrict ?
        <div className="flex items-start gap-2">
          <TriangleAlert size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="font-semibold text-red-600">In this puzzle, it is also required the goal is not satisfied too early, i.e. at generation {puzzle.minimalSteps - 1}.</span>
        </div> : <span></span>
      }
    </div>
  );
}

function ValidationMessage({ result }: { result: { isValid: boolean; message?: string } }) {
  const isValid = result.isValid;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {isValid ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`font-medium ${isValid ? "text-green-800" : "text-red-800"}`}>
            {result.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PuzzleSubmit({
  puzzle,
  generation,
  validationResult,
  isSubmitting,
  isPuzzleCompleted = false,
  onSubmit,
}: PuzzleSubmitProps) {
  const hasConditions = !!(
    (puzzle?.initialConditions && puzzle.initialConditions.length > 0) ||
    (puzzle?.finalConditions && puzzle.finalConditions.length > 0)
  );

  const renderStatusMessage = () => {
    // Don't show any status message if we have a valid solution
    // this is needed to avoid showing "Solution submitted successfully!" and "Puzzle already completed"
    if (validationResult && validationResult.isValid) {
      return null;
    }

    if (isPuzzleCompleted) {
      return <CompletedMessage />;
    }

    if (hasConditions && puzzle) {
      return <PuzzleInstructions puzzle={puzzle} />;
    }

    if (generation !== 0) {
      return (
        <p className="text-sm text-gray-500">
          Reset to generation 0 before submitting your solution.
        </p>
      );
    }

    return <p className="text-sm text-gray-500">Place your cells and press submit when ready.</p>;
  };

  const buttonClassName = isPuzzleCompleted
    ? "bg-gray-400 cursor-not-allowed text-white"
    : "bg-linera-primary hover:bg-linera-primary-dark text-white";

  const buttonText = isPuzzleCompleted ? "Already Completed" : "Submit Solution";

  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-4">
          {renderStatusMessage()}

          {validationResult && <ValidationMessage result={validationResult} />}

          <Button
            onPress={onSubmit}
            isLoading={isSubmitting}
            isDisabled={isPuzzleCompleted}
            className={`w-full font-medium ${buttonClassName}`}
            size="lg"
          >
            {buttonText}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
