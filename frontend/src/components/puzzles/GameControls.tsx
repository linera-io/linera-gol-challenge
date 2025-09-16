import { Button } from "@heroui/button";
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Target,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

interface GameControlsProps {
  isPlaying: boolean;
  canUndo: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClear: () => void;
  onResetToInitial: () => void;
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
  onResetToInitial,
  showHints = false,
  showGoals = false,
  onToggleHints,
  onToggleGoals,
  hasConditions = false,
}: GameControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3 items-center">
        <Tooltip content="Previous generation">
          <button
            onClick={onPrevious}
            disabled={!canUndo}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Tooltip>
        <Tooltip content={isPlaying ? "Pause" : "Play"}>
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-3 rounded-full bg-linera-primary hover:bg-linera-primary-dark text-white transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            )}
          </button>
        </Tooltip>
        <Tooltip content="Next generation">
          <button
            onClick={onNext}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </Tooltip>
        <div className="w-px h-8 bg-gray-300 mx-2" /> {/* Divider */}
        <Tooltip content="Reset to generation 0">
          <button
            onClick={onResetToInitial}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </Tooltip>
        <Tooltip content="Clear all cells">
          <button
            onClick={onClear}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-5 h-5 text-gray-600" />
          </button>
        </Tooltip>
      </div>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        {hasConditions && (
          <>
            <Button
              variant="flat"
              onPress={onToggleHints}
              className={`font-medium text-xs sm:text-base px-4 py-2 sm:px-6 sm:py-2.5 min-w-[120px] sm:min-w-[140px] rounded-full transition-colors flex items-center gap-2 ${
                showHints
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              Show Hints
            </Button>
            <Button
              variant="flat"
              onPress={onToggleGoals}
              className={`font-medium text-xs sm:text-base px-4 py-2 sm:px-6 sm:py-2.5 min-w-[120px] sm:min-w-[140px] rounded-full transition-colors flex items-center gap-2 ${
                showGoals
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Show Goal
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
