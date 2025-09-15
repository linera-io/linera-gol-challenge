import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PuzzleSubmitProps {
  validationResult: { isValid: boolean; message?: string } | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function PuzzleSubmit({ validationResult, isSubmitting, onSubmit }: PuzzleSubmitProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Place your cells and press submit when ready.</p>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-4 rounded-lg border ${
                validationResult.isValid
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      validationResult.isValid ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {validationResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onPress={onSubmit}
            isLoading={isSubmitting}
            className="w-full font-medium bg-linera-primary hover:bg-linera-primary-dark text-white"
            size="lg"
          >
            Submit Solution
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}