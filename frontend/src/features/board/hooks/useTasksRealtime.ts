import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export const useTasksRealtime = (boardId: string) => {
  const queryClient = useQueryClient();
  console.log("In useTasksRealtime", boardId);

  useEffect(() => {
    const channel = supabase
      .channel(`table-db-changes:tasks`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log("Change received!", payload);
          queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, queryClient]);
};
