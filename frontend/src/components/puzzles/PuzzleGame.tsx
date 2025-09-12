import { usePuzzleGame } from "@/lib/game-of-life/hooks/usePuzzleGame";
import { GameHeader } from "./GameHeader";
import { PuzzleSelectionView } from "./PuzzleSelectionView";
import { GamePlayingView } from "./GamePlayingView";
import { useState } from "react";

export function PuzzleGame() {
  const game = usePuzzleGame();
  const [showTutorial, setShowTutorial] = useState(true);

  const handleCellClick = (x: number, y: number) => {
    game.toggleCell(x, y);
  };

  const handleSelectPuzzle = (puzzleId: string) => {
    game.loadPuzzle(puzzleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <GameHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {game.showPuzzleList ? (
          <PuzzleSelectionView
            onSelectPuzzle={handleSelectPuzzle}
            currentPuzzleId={game.currentPuzzleId || undefined}
          />
        ) : (
          <GamePlayingView
            puzzle={game.currentPuzzle}
            isPuzzleLoading={game.isPuzzleLoading}
            generation={game.generation}
            cells={game.cells}
            validationResult={game.validationResult}
            isValidating={game.isValidating}
            isSubmitting={game.isSubmitting}
            isPlaying={game.isPlaying}
            canUndo={game.canUndo}
            showTutorial={showTutorial}
            onBackToPuzzles={() => game.setShowPuzzleList(true)}
            onCellClick={handleCellClick}
            onPlay={game.play}
            onPause={game.pause}
            onNext={game.next}
            onPrevious={game.previous}
            onClear={game.clear}
            onSubmit={game.submitSolution}
            onCloseTutorial={() => setShowTutorial(false)}
          />
        )}
      </div>
    </div>
  );
}
