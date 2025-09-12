import { useQuery } from "@tanstack/react-query";
import { LineraService } from "../services/LineraService";
import { useAuth } from "./useAuth";

export const QUERY_KEYS = {
  wallet: ["linera", "wallet"],
  initialized: ["linera", "initialized"],
};

export function useLineraInitialization() {
  const { isConnectedToLinera, isAppConnected } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.initialized,
    queryFn: async () => {
      return isConnectedToLinera && isAppConnected;
    },
    enabled: true,
    staleTime: Infinity,
  });
}

export function useWallet() {
  const { walletAddress, chainId } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.wallet,
    queryFn: async () => {
      const service = LineraService.getInstance();
      return service.checkWallet();
    },
    enabled: !!walletAddress && !!chainId,
    staleTime: Infinity,
  });
}

export function useLineraOperations() {
  const auth = useAuth();
  useLineraInitialization();
  const wallet = useWallet();

  return {
    isInitialized: auth.isConnectedToLinera && auth.isAppConnected,
    isInitializing: auth.isLoading,
    initError: auth.error,
    wallet: wallet.data,
    auth,
  };
}
