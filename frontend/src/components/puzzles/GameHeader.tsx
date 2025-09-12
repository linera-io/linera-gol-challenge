import { Gamepad2 } from "lucide-react";
import { WalletConnect } from "@/components/wallet/WalletConnect";

export function GameHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5 text-linera-primary" />
            <h1 className="text-lg font-semibold text-gray-900">Conway's Game of Life</h1>
            <span className="hidden sm:inline text-sm text-gray-500">
              • Powered by <span className="text-linera-primary font-medium">Linera</span>
            </span>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
