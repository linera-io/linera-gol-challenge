import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Badge } from '@heroui/badge';
import { Button } from '@heroui/button';
import { CheckCircle, AlertCircle, Target, Zap } from 'lucide-react';
import { PuzzleInfo as PuzzleData } from '@/lib/game-of-life/hooks/usePuzzleGame';

interface PuzzleInfoProps {
  puzzle: PuzzleData | null;
  generation: number;
  validationResult: { isValid: boolean; message?: string } | null;
  isValidating: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClear: () => void;
}

const difficultyConfig = {
  Easy: { color: 'success' as const, icon: '🌱' },
  Medium: { color: 'warning' as const, icon: '🔥' },
  Hard: { color: 'danger' as const, icon: '💀' }
};

export function PuzzleInfo({
  puzzle,
  generation,
  validationResult,
  isValidating,
  isSubmitting,
  onSubmit,
  onClear
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
  const config = difficultyConfig[difficulty] || difficultyConfig.Easy;

  return (
    <div className="space-y-4">
      {/* Puzzle Header Card */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {puzzle.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  color={config.color} 
                  variant="flat"
                  size="sm"
                >
                  {config.icon} {difficulty}
                </Badge>
                <Badge 
                  variant="flat"
                  size="sm"
                  className="bg-gray-100"
                >
                  {puzzle.size}×{puzzle.size} Grid
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <p className="text-gray-700 text-sm leading-relaxed">
            {puzzle.summary}
          </p>
        </CardBody>
      </Card>

      {/* Game Progress Card */}
      <Card className="bg-white shadow-lg">
        <CardBody>
          <div className="space-y-4">
            {/* Steps Display */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Current Generation:
              </span>
              <Badge 
                color={generation === 0 ? "success" : "warning"} 
                variant="solid"
                size="lg"
              >
                {generation}
              </Badge>
            </div>

            {/* Instructions */}
            {generation !== 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Reset to generation 0 to validate
                </p>
              </div>
            )}

            {generation === 0 && !validationResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Place your cells and click submit when ready
                </p>
              </div>
            )}

            {/* Validation Result */}
            {validationResult && (
              <div className={`p-4 rounded-lg border ${
                validationResult.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.message}
                    </p>
                    {validationResult.isValid && (
                      <p className="text-sm text-green-700 mt-1">
                        You can now submit your solution!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              color="success"
              onPress={onSubmit}
              isLoading={isSubmitting}
              isDisabled={!canValidate}
              className="w-full font-medium"
              size="lg"
              startContent={<Zap size={18} />}
            >
              Submit Solution
            </Button>

            <Button
              color="danger"
              variant="light"
              onPress={onClear}
              isDisabled={isValidating || isSubmitting}
              className="w-full"
            >
              Clear Board
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}