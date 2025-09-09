import { Button } from "@heroui/button";
import { Play, Pause, ChevronRight, ChevronLeft } from "lucide-react";

interface GameControlsProps {
  isPlaying: boolean;
  canUndo: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClear: () => void;
}

export function GameControls({
  isPlaying,
  canUndo,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onClear
}: GameControlsProps) {
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
      <Button
        variant="flat"
        onPress={onClear}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-lg px-8 min-w-[120px] rounded-full"
      >
        Clear
      </Button>
    </div>
  );
}