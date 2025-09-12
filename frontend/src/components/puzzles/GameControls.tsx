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
  minSteps?: number;
  maxSteps?: number;
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
  minSteps,
  maxSteps,
}: GameControlsProps) {
  const hasStepRequirement = minSteps !== undefined && maxSteps !== undefined;
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 items-center">
        <button
          onClick={onPrevious}
          disabled={!canUndo}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-16 h-16 rounded-full bg-linera-primary hover:bg-linera-primary-dark text-white flex items-center justify-center transition-colors shadow-lg"
        >
          {isPlaying ? (
            <Pause size={28} className="fill-white" />
          ) : (
            <Play size={28} className="ml-1 fill-white" />
          )}
        </button>
        <button
          onClick={onNext}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
      <div className="flex gap-3 items-center">
        {hasConditions && (
          <>
            <Tooltip content="Show starting position hints">
              <button
                onClick={onToggleHints}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  showHints
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                <Lightbulb size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Show goal pattern">
              <button
                onClick={onToggleGoals}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  showGoals
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                <Target size={20} />
              </button>
            </Tooltip>
          </>
        )}
        <Button
          variant="flat"
          onPress={onClear}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-lg px-8 min-w-[120px] rounded-full"
        >
          Clear
        </Button>
      </div>
      {hasStepRequirement && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-gray-700">
              {minSteps === maxSteps
                ? `Reach goal pattern in exactly ${minSteps} step${minSteps !== 1 ? "s" : ""}`
                : `Reach goal pattern in ${minSteps}-${maxSteps} steps`}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Each step = 1 generation of the Game of Life
          </div>
        </div>
      )}
    </div>
  );
}
