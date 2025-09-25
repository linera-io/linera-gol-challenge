import { usePuzzleGame } from "@/lib/game-of-life/hooks/usePuzzleGame";
import { useCompletedPuzzles } from "@/lib/game-of-life/hooks/useCompletedPuzzles";
import { GameHeader } from "./GameHeader";
import { PuzzleSelectionView } from "./PuzzleSelectionView";
import { GamePlayingView } from "./GamePlayingView";
import { useState } from "react";
import { useLineraNotifications } from "@/lib/linera/hooks/useLineraNotifications";

export function PuzzleGame() {
  const game = usePuzzleGame();
  const { isPuzzleCompleted, isLoadingFromBlockchain: areCompletedPuzzlesLoading} = useCompletedPuzzles();
  const [showTutorial, setShowTutorial] = useState(true);

  // Set up notification handling for React Query invalidation
  useLineraNotifications();


  const handleCellClick = (x: number, y: number) => {
    if (game.generation == 0) {
      game.toggleCell(x, y);
    }
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
            areCompletedPuzzlesLoading={areCompletedPuzzlesLoading}
            puzzle={game.currentPuzzle}
            isPuzzleLoading={game.isPuzzleLoading}
            isPuzzleCompleted={
              game.currentPuzzleId ? isPuzzleCompleted(game.currentPuzzleId) : false
            }
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
            onResetToInitial={game.resetToInitial}
            onSubmit={game.submitSolution}
            onNextPuzzle={game.loadNextPuzzle}
            onPreviousPuzzle={game.loadPreviousPuzzle}
            onCloseTutorial={() => setShowTutorial(false)}
          />
        )}
      </div>
    </div>
  );
}
