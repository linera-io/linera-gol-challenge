import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ArrowLeft, Info } from "lucide-react";
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
  onCloseTutorial: () => void;
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
  onCloseTutorial
}: GamePlayingViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          color="primary"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={onBackToPuzzles}
        >
          Back to Puzzles
        </Button>
        <h2 className="text-xl font-bold text-gray-900">
          {puzzle?.title || "Puzzle"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PuzzleInfo
            puzzle={puzzle}
            generation={generation}
            validationResult={validationResult}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onClear={onClear}
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
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
                />
              </div>
            </CardBody>
          </Card>

          {showTutorial && (
            <Card className="bg-white shadow-lg mt-4">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Info size={18} className="text-gray-700" />
                      How to Play
                    </h3>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>🎯 <strong>Place cells</strong> by clicking on the grid to create your pattern</li>
                      <li>▶️ <strong>Test your solution</strong> using the play button to see how it evolves</li>
                      <li>↩️ <strong>Reset to generation 0</strong> before submitting your solution</li>
                      <li>🚀 <strong>Submit</strong> when you think you've solved the puzzle to record it on the blockchain!</li>
                    </ol>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onCloseTutorial}
                  >
                    ✕
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}