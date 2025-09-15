import { Card, CardBody } from "@heroui/card";
import { Sparkles } from "lucide-react";

export function PuzzleTutorial() {
  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
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
                <span>
                  <strong>Survival:</strong> A living cell with 2 or 3 living neighbors stays
                  alive
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  <strong>Death:</strong> A living cell with fewer than 2 or more than 3 neighbors
                  dies
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>
                  <strong>Birth:</strong> A dead cell with exactly 3 living neighbors becomes
                  alive
                </span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-2 italic">
              All changes happen simultaneously each generation!
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
