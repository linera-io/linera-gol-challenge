import { Loader2, Wallet, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@heroui/button";

interface LoadingScreenProps {
  message?: string;
  showConnectButton?: boolean;
  onConnect?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingScreen({
  message = "Loading Game of Life...",
  showConnectButton = false,
  onConnect,
  error,
  onRetry,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-linera-primary rounded-2xl flex items-center justify-center shadow-lg">
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-sm ${
                    [1, 3, 4, 5, 7].includes(i) ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conway's Game of Life</h1>
          <p className="text-gray-500">
            Powered by <span className="text-linera-primary font-medium">Linera</span>
          </p>
        </div>

        {/* Loading or Error State */}
        {error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
            {onRetry && (
              <Button
                variant="flat"
                onPress={onRetry}
                startContent={<RefreshCw size={16} />}
                className="bg-linera-primary text-white hover:bg-linera-primary-dark"
              >
                Retry Connection
              </Button>
            )}
          </div>
        ) : showConnectButton ? (
          <div className="space-y-4">
            <p className="text-gray-600">{message}</p>
            <Button
              size="lg"
              variant="flat"
              onPress={onConnect}
              startContent={<Wallet size={20} />}
              className="bg-linera-primary text-white hover:bg-linera-primary-dark px-8"
            >
              Log In
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-linera-primary animate-spin" />
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
