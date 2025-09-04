import { Button } from "@heroui/button";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";

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
    <div className="flex justify-center">
      <div className="flex gap-2">
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          onPress={isPlaying ? onPause : onPlay}
          size="lg"
        >
          {isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} />
          )}
        </Button>
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          onPress={onPrevious}
          isDisabled={!canUndo}
          size="lg"
        >
          <SkipBack size={20} />
        </Button>
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          onPress={onNext}
          size="lg"
        >
          <SkipForward size={20} />
        </Button>
        <Button
          isIconOnly
          color="danger"
          variant="flat"
          onPress={onClear}
          size="lg"
        >
          <RotateCcw size={20} />
        </Button>
      </div>
    </div>
  );
}