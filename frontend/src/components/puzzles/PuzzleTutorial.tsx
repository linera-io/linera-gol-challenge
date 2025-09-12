import { Card, CardBody } from "@heroui/card";
import { Info, Grid3x3, Play, Check, Lightbulb, Target, Sparkles } from "lucide-react";

export function PuzzleTutorial() {
  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-5">
          {/* Game Rules Section */}
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-gray-400" />
              Conway's Game of Life Rules
            </h3>
            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">Each cell follows simple rules:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span><strong>Survival:</strong> A living cell with 2 or 3 living neighbors stays alive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span><strong>Death:</strong> A living cell with fewer than 2 or more than 3 neighbors dies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span><strong>Birth:</strong> A dead cell with exactly 3 living neighbors becomes alive</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-2 italic">
                All changes happen simultaneously each generation!
              </p>
            </div>
          </div>

          {/* How to Play Section */}
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Info size={18} className="text-gray-400" />
              How to Play
            </h3>
            <div className="space-y-3">
            <div className="flex gap-3">
              <Grid3x3
                size={20}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-500">
                Place cells by clicking on the grid to create your
                desired pattern.
              </p>
            </div>
            <div className="flex gap-3">
              <Play
                size={20}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-500">
                Test your solution by pressing "Play" to advance the
                simulation and check the outcome.
              </p>
            </div>
            <div className="flex gap-3">
              <Lightbulb
                size={20}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-500">
                Use "Show hints" to see the starting position constraints -
                green cells must be alive, red cells must be dead.
              </p>
            </div>
            <div className="flex gap-3">
              <Target
                size={20}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-500">
                Use "Show goals" to see the target pattern you need to achieve -
                highlighted areas show where cells should end up.
              </p>
            </div>
            <div className="flex gap-3">
              <Check
                size={20}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-500">
                Submit when you've solved the puzzle to record
                it on the blockchain!
              </p>
            </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}