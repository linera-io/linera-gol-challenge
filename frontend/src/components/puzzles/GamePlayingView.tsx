import { useState, useMemo, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import { GameBoardWrapper } from "@/components/game-of-life/GameBoardWrapper";
import { PuzzleHeader } from "./PuzzleHeader";
import { PuzzleSubmit } from "./PuzzleSubmit";
import { GameControls } from "./GameControls";
import { PuzzleTutorial } from "./PuzzleTutorial";
import { GameBoardSkeleton } from "./GamePlayingSkeleton";
import { Puzzle as PuzzleData } from "@/lib/types/puzzle.types";
import { BOARD_CONFIG } from "@/lib/game-of-life/config/board-config";

interface GamePlayingViewProps {
  puzzle: PuzzleData | null;
  isPuzzleLoading?: boolean;
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
  isPuzzleLoading = false,
  generation,
  cells,
  validationResult,
  isSubmitting,
  isPlaying,
  canUndo,
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
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const hasConditions = !!(
    (puzzle?.initialConditions && puzzle.initialConditions.length > 0) ||
    (puzzle?.finalConditions && puzzle.finalConditions.length > 0)
  );

  // Track window size for responsive cell sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate optimal cell size based on viewport and puzzle size
  const optimalCellSize = useMemo(() => {
    if (!puzzle?.size || windowSize.width === 0) {
      return 30; // Default cell size
    }

    const puzzleSize = puzzle.size;

    // Simple logic: use desktop or mobile max width
    const isMobile = windowSize.width < 768; // Standard mobile breakpoint
    const maxBoardWidth = isMobile ? BOARD_CONFIG.MAX_MOBILE_WIDTH : BOARD_CONFIG.MAX_DESKTOP_WIDTH;

    // Calculate max available space (leaving some room for UI)
    const maxHeight = windowSize.height * 0.7 - 120; // 70% of viewport minus controls

    // Calculate cell size that fits both dimensions
    const cellSizeByWidth = Math.floor(maxBoardWidth / puzzleSize);
    const cellSizeByHeight = Math.floor(maxHeight / puzzleSize);

    // Use the smaller to ensure it fits
    const optimalSize = Math.min(cellSizeByWidth, cellSizeByHeight);

    // Enforce min/max for usability
    return Math.max(BOARD_CONFIG.MIN_CELL, Math.min(BOARD_CONFIG.MAX_CELL, optimalSize));
  }, [puzzle?.size, windowSize.width, windowSize.height]);

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

      {isPuzzleLoading ? (
        <div className="flex justify-center">
          <div className="w-64 h-9 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      ) : (
        puzzle && <h1 className="text-3xl font-bold text-gray-900 text-center">{puzzle.title}</h1>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <PuzzleHeader puzzle={puzzle} isPuzzleLoading={isPuzzleLoading} />

          {!isPuzzleLoading && puzzle && (
            // remove them from small screens to have another layout order
            <>
              <div className="hidden lg:block">
                <PuzzleTutorial />
              </div>
              <div className="hidden lg:block">
                <PuzzleSubmit
                  puzzle={puzzle}
                  generation={generation}
                  validationResult={validationResult}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                />
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
                  Game of Life Playground
                </h2>
                {isPuzzleLoading || !puzzle?.size ? (
                  <GameBoardSkeleton />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center rounded-lg">
                      <div className="border-2 border-gray-200 rounded-lg overflow-auto max-h-[70vh]">
                        <GameBoardWrapper
                          width={puzzle.size}
                          height={puzzle.size}
                          cells={cells}
                          onCellClick={onCellClick}
                          cellSize={optimalCellSize}
                          initialConditions={
                            showInitialConditions ? puzzle?.initialConditions : undefined
                          }
                          finalConditions={showFinalConditions ? puzzle?.finalConditions : undefined}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded-full">
                        <span className="text-sm font-medium">Generation:</span>
                        <span className="text-lg font-bold">{generation}</span>
                      </div>
                    </div>
                  </div>
                )}

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

        <div className="lg:hidden order-2 space-y-4">
          {!isPuzzleLoading && puzzle && (
            <>
              <PuzzleSubmit
                puzzle={puzzle}
                generation={generation}
                validationResult={validationResult}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
              />
              <PuzzleTutorial />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
