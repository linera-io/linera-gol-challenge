import { Button } from "@heroui/button";
import { useAuth, shortenAddress } from "@/lib/linera/hooks/useAuth";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnect() {
  const {
    isLoggedIn,
    isLoading,
    walletAddress,
    isConnectedToLinera,
    showConnectWallet,
    disconnect,
  } = useAuth();

  if (isLoading) {
    return (
      <Button
        size="sm"
        variant="flat"
        disabled
        className="bg-gray-100"
      >
        Connecting...
      </Button>
    );
  }

  if (!isLoggedIn || !walletAddress) {
    return (
      <Button
        size="sm"
        variant="flat"
        onPress={showConnectWallet}
        startContent={<Wallet size={16} />}
        className="bg-linera-primary text-white hover:bg-linera-primary-dark"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnectedToLinera ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-gray-700">
            {shortenAddress(walletAddress)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="light"
        isIconOnly
        onPress={disconnect}
        className="text-gray-600 hover:text-gray-900"
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
}