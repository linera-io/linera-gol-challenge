import { Card, CardBody } from "@heroui/card";
import { Grid3x3 } from "lucide-react";
import { PuzzleList } from "./PuzzleList";

interface PuzzleSelectionViewProps {
  onSelectPuzzle: (puzzleId: string) => void;
  currentPuzzleId?: string;
}

export function PuzzleSelectionView({ 
  onSelectPuzzle, 
  currentPuzzleId 
}: PuzzleSelectionViewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Choose Your Challenge
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PuzzleList
            onSelectPuzzle={onSelectPuzzle}
            currentPuzzleId={currentPuzzleId}
          />
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg h-full">
            <CardBody className="flex items-center justify-center">
              <div className="text-center">
                <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to Start?
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Select a puzzle from the list to begin your challenge
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}