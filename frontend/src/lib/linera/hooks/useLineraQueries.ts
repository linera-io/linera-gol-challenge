import { useQuery } from "@tanstack/react-query";
import { LineraService } from "../services/LineraService";

export const QUERY_KEYS = {
  wallet: ["linera", "wallet"],
  initialized: ["linera", "initialized"],
};

const initializeService = async () => {
  const service = LineraService.getInstance();
  await new Promise((f) => setTimeout(f, 100));
  await service.initialize();
  return true;
};

export function useLineraInitialization() {
  return useQuery({
    queryKey: QUERY_KEYS.initialized,
    queryFn: initializeService,
    staleTime: Infinity,
    retry: 3,
  });
}

export function useWallet() {
  return useQuery({
    queryKey: QUERY_KEYS.wallet,
    queryFn: async () => {
      const service = LineraService.getInstance();
      return service.checkWallet();
    },
    staleTime: Infinity,
  });
}

export function useLineraOperations() {
  const initialization = useLineraInitialization();
  const wallet = useWallet();

  return {
    isInitialized: initialization.isSuccess,
    isInitializing: initialization.isLoading,
    initError: initialization.error,
    wallet: wallet.data,
  };
}
