import { Card, CardBody } from "@heroui/card";
import { Target } from "lucide-react";
import { Puzzle } from "@/lib/types/puzzle.types";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";

interface PuzzleHeaderProps {
  puzzle: Puzzle | null;
  isPuzzleLoading?: boolean;
}

export function PuzzleHeader({ puzzle, isPuzzleLoading }: PuzzleHeaderProps) {
  if (isPuzzleLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardBody className="p-6">
          <div className="space-y-3">
            <div className="w-48 h-7 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!puzzle) {
    return (
      <Card className="bg-white shadow-lg">
        <CardBody className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Select a puzzle to begin</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{puzzle.title}</h3>
            <DifficultyBadge difficulty={puzzle.difficulty || "EASY"} size="sm" />
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{puzzle.summary}</p>
        </div>
      </CardBody>
    </Card>
  );
}