import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ArrowLeft, Info, Grid3x3, Play, Check } from "lucide-react";
import { GameBoardWrapper } from "@/components/game-of-life/GameBoardWrapper";
import { PuzzleInfo } from "./PuzzleInfo";
import { GameControls } from "./GameControls";
import { PuzzleInfo as PuzzleData } from "@/lib/game-of-life/hooks/usePuzzleGame";
import { PUZZLE_BOARD_SIZE } from "@/lib/game-of-life/data/puzzles";

interface GamePlayingViewProps {
  puzzle: PuzzleData | null;
  generation: number;
  cells: Map<string, boolean>;
  validationResult: { isValid: boolean; message?: string } | null;
  isValidating: boolean;
  isSubmitting: boolean;
  isPlaying: boolean;
  canUndo: boolean;
  showTutorial: boolean;
  onBackToPuzzles: () => void;
  onCellClick: (x: number, y: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onCloseTutorial?: () => void;
}

export function GamePlayingView({
  puzzle,
  generation,
  cells,
  validationResult,
  isValidating,
  isSubmitting,
  isPlaying,
  canUndo,
  showTutorial,
  onBackToPuzzles,
  onCellClick,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onClear,
  onSubmit,
}: GamePlayingViewProps) {
  const [showInitialConditions, setShowInitialConditions] = useState(false);
  const [showFinalConditions, setShowFinalConditions] = useState(false);
  
  const hasConditions = !!(
    (puzzle?.initialConditions && puzzle.initialConditions.length > 0) ||
    (puzzle?.finalConditions && puzzle.finalConditions.length > 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={onBackToPuzzles}
          className="text-linera-primary hover:text-linera-primary-dark"
        >
          Back to Puzzles
        </Button>
        <div className="flex-1" />
      </div>

      {puzzle && (
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          {puzzle.title}
        </h1>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <PuzzleInfo
            puzzle={puzzle}
            generation={generation}
            validationResult={validationResult}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onClear={onClear}
          />

          {showTutorial && (
            <Card className="bg-white shadow-lg">
              <CardBody className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info size={18} className="text-gray-400" />
                    How to Play
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Grid3x3
                        size={20}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-gray-500">
                        Place cells by clicking on the grid to create your
                        desired pattern.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Play
                        size={20}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-gray-500">
                        Test your solution by pressing the "Play" to advance the
                        simulation and check the outcome.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Check
                        size={20}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-gray-500">
                        Submit when you think you've solved the puzzle to record
                        it on the blockchain!
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
                  Game of Life Playground
                </h2>
                <div className="flex items-center justify-center  rounded-lg p-4">
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <GameBoardWrapper
                      width={puzzle?.size || PUZZLE_BOARD_SIZE}
                      height={puzzle?.size || PUZZLE_BOARD_SIZE}
                      cells={cells}
                      onCellClick={onCellClick}
                      cellSize={Math.max(
                        30,
                        Math.min(60, 500 / (puzzle?.size || PUZZLE_BOARD_SIZE))
                      )}
                      initialConditions={showInitialConditions ? puzzle?.initialConditions : undefined}
                      finalConditions={showFinalConditions ? puzzle?.finalConditions : undefined}
                    />
                  </div>
                </div>

                <GameControls
                  isPlaying={isPlaying}
                  canUndo={canUndo}
                  onPlay={onPlay}
                  onPause={onPause}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  onClear={onClear}
                  showHints={showInitialConditions}
                  showGoals={showFinalConditions}
                  onToggleHints={() => setShowInitialConditions(!showInitialConditions)}
                  onToggleGoals={() => setShowFinalConditions(!showFinalConditions)}
                  hasConditions={hasConditions}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
