import { Button } from "@heroui/button";
import { Play, Pause, ChevronRight, ChevronLeft, Lightbulb, Target } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

interface GameControlsProps {
  isPlaying: boolean;
  canUndo: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClear: () => void;
  showHints?: boolean;
  showGoals?: boolean;
  onToggleHints?: () => void;
  onToggleGoals?: () => void;
  hasConditions?: boolean;
}

export function GameControls({
  isPlaying,
  canUndo,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onClear,
  showHints = false,
  showGoals = false,
  onToggleHints,
  onToggleGoals,
  hasConditions = false,
}: GameControlsProps) {

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 items-center">
        <button
          onClick={onPrevious}
          disabled={!canUndo}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-full bg-linera-primary hover:bg-linera-primary-dark text-white transition-colors shadow-lg"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span className="text-xs sm:text-base font-medium">Stop Evolving</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-white" />
              <span className="text-xs sm:text-base font-medium">Start Evolving</span>
            </>
          )}
        </button>
        <button
          onClick={onNext}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>
      <div className="flex gap-3 items-center">
        {hasConditions && (
          <>
            <Tooltip content="Show starting position hints">
              <button
                onClick={onToggleHints}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  showHints
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>
            <Tooltip content="Show goal pattern">
              <button
                onClick={onToggleGoals}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  showGoals
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>
          </>
        )}
        <Button
          variant="flat"
          onPress={onClear}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-xs sm:text-base px-4 py-2 sm:px-6 sm:py-2.5 min-w-[120px] sm:min-w-[140px] rounded-full"
        >
          Reset Generations
        </Button>
      </div>
    </div>
  );
}
