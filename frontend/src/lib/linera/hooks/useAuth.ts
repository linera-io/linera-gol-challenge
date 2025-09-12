import { useEffect, useCallback } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineraService } from "../services/LineraService";
import { lineraAdapter } from "../lib/linera-adapter";

export function useAuth() {
  const { sdkHasLoaded, primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const queryClient = useQueryClient();

  const { data: lineraConnection, isLoading: isConnecting } = useQuery({
    queryKey: ["linera-connection", primaryWallet?.address],
    queryFn: async () => {
      if (!primaryWallet) return null;

      const service = LineraService.getInstance();
      await service.initialize(primaryWallet);
      const walletInfo = await service.checkWallet();

      return {
        isConnected: true,
        chainId: walletInfo?.chainId || null,
      };
    },
    enabled: !!primaryWallet && isLoggedIn,
    retry: 1,
    staleTime: Infinity,
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const service = LineraService.getInstance();
      await service.disconnect();
      await handleLogOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linera-connection"] });
    },
  });

  const showConnectWallet = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const retryConnection = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["linera-connection"] });
  }, [queryClient]);

  useEffect(() => {
    const handleConnectionChange = () => {
      queryClient.invalidateQueries({ queryKey: ["linera-connection"] });
    };

    lineraAdapter.onConnectionStateChange(handleConnectionChange);
    return () => {
      lineraAdapter.offConnectionStateChange();
    };
  }, [queryClient]);

  return {
    isLoading: !sdkHasLoaded || isConnecting,
    isLoggedIn,
    isConnectedToLinera: !!lineraConnection?.isConnected,
    isAppConnected: !!lineraConnection?.isConnected,
    walletAddress: primaryWallet?.address || null,
    chainId: lineraConnection?.chainId || null,
    error: null,
    showConnectWallet,
    disconnect: disconnectMutation.mutate,
    retryConnection,
    primaryWallet,
    sdkHasLoaded,
  };
}

// Helper function to shorten wallet address
export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
