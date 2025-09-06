import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-xl">
        <CardBody className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Conway's Game of Life
              </h1>
              <p className="text-sm text-gray-600">
                Powered by{" "}
                <span className="text-linera-primary font-semibold">
                  Linera
                </span>
              </p>
            </div>

            {/* Loading Spinner */}
            <div className="relative">
              <Spinner
                size="lg"
                color="danger"
                classNames={{
                  circle1: "border-b-linera-primary",
                  circle2: "border-b-linera-primary-light",
                }}
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-700 font-medium">
                Initializing Blockchain Wallet
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            </div>

            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #DE2A02 1px, transparent 1px),
                    linear-gradient(to bottom, #DE2A02 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
