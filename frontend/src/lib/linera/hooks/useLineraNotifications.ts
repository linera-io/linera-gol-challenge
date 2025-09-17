import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LineraService } from "../services/LineraService";
import { useLineraInitialization } from "./useLineraQueries";

export function useLineraNotifications() {
  const queryClient = useQueryClient();
  const { data: initialized } = useLineraInitialization();

  useEffect(() => {
    if (!initialized) return;

    const lineraService = LineraService.getInstance();
    
    // Set up notification handler
    lineraService.onNotification((notification) => {
      console.log("[GOL] Received notification:", notification);
      
      // When a new block is created, it might contain puzzle completions
      // Invalidate the completed puzzles query to refetch
      queryClient.invalidateQueries({ queryKey: ["completedPuzzles"] });
    });

    return () => {
      // Cleanup is handled by LineraService disconnect
    };
  }, [initialized, queryClient]);
}