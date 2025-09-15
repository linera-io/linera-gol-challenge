import { Card, CardBody } from "@heroui/card";
import { Info, Lightbulb, Target, Grid3x3, Play, Send, X } from "lucide-react";

interface HowToPlayTutorialProps {
  onDismiss: () => void;
}

export function HowToPlayTutorial({ onDismiss }: HowToPlayTutorialProps) {
  return (
    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 z-40 sm:top-4 sm:right-4 p-1 rounded-full hover:bg-red-100 transition-colors"
        aria-label="Dismiss tutorial"
      >
        <X size={18} className="text-red-600" />
      </button>
      <CardBody className="p-4 sm:p-6">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-start sm:items-center gap-2 mb-3 sm:mb-4 pr-6 text-sm sm:text-base">
            <Info size={18} className="text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span>How to Play - Step by Step Guide</span>
          </h3>
          <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed">
                  Understand how to play the{" "}
                  <a
                    href="https://www.youtube.com/watch?v=R9Plq-D1gEk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 underline font-medium break-words"
                  >
                    Game of Life
                  </a>{" "}
                  - watch the video to learn the basics
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <div className="flex-1">
                <div className="text-gray-700 leading-relaxed">
                  <span>Click on the </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium align-middle">
                    <Lightbulb size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-xs sm:text-sm">bulb</span>
                  </span>
                  <span> to see hints and understand what the initial state should look like</span>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <div className="flex-1">
                <div className="text-gray-700 leading-relaxed">
                  <span>Click on the </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium align-middle">
                    <Target size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-xs sm:text-sm">target</span>
                  </span>
                  <span> to see what the end position should look like</span>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <div className="flex-1">
                <p className="text-gray-700 flex items-start gap-1 sm:gap-2 leading-relaxed">
                  <Grid3x3 size={16} className="text-gray-500 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span>Draw the initial puzzle by clicking cells on the grid</span>
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                5
              </span>
              <div className="flex-1">
                <p className="text-gray-700 flex items-start gap-1 sm:gap-2 leading-relaxed">
                  <Play size={16} className="text-gray-500 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span>Click <strong>"Start Evolving"</strong> to see how the puzzle changes after generations</span>
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                6
              </span>
              <div className="flex-1">
                <p className="text-gray-700 flex items-start gap-1 sm:gap-2 leading-relaxed">
                  <Send size={16} className="text-gray-500 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span>Submit the puzzle if you found the solution!</span>
                </p>
              </div>
            </li>
          </ol>
        </div>
      </CardBody>
    </Card>
  );
}