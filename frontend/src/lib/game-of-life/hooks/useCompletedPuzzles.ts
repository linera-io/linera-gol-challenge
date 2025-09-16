import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LineraService } from "@/lib/linera/services/LineraService";
import { useLineraInitialization } from "@/lib/linera/hooks/useLineraQueries";

export function useCompletedPuzzles() {
  const { data: initialized } = useLineraInitialization();
  const queryClient = useQueryClient();

  const {
    data: completedPuzzleIds = [],
    refetch,
    isLoading: isLoadingFromBlockchain,
  } = useQuery({
    queryKey: ["completedPuzzles"],
    queryFn: async () => {
      const lineraService = LineraService.getInstance();
      const response = lineraService.getCompletedPuzzleIds();
      console.log("[GOL] Got completed puzzle IDs", response);
      return response;
    },
    enabled: initialized,
    staleTime: 30000,
  });

  const isPuzzleCompleted = useCallback(
    (puzzleId: string) => {
      return completedPuzzleIds.includes(puzzleId);
    },
    [completedPuzzleIds]
  );

  const getCompletionCount = useCallback(() => {
    return completedPuzzleIds.length;
  }, [completedPuzzleIds]);

  // Refresh the completed puzzles from blockchain
  const refreshCompletedPuzzles = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["completedPuzzles"] });
  }, [refetch, queryClient]);

  return {
    completedPuzzleIds,
    isPuzzleCompleted,
    getCompletionCount,
    refreshCompletedPuzzles,
    isLoadingFromBlockchain: isLoadingFromBlockchain || !initialized,
  };
}
