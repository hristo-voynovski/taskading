import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export const useTasksRealtime = (boardId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`table-db-changes:tasks`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          // console.log("Change received! (INSERT)", payload);
          queryClient.refetchQueries({ queryKey: ["tasks", boardId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          // console.log("Change received! (UPDATE)", payload);
          queryClient.refetchQueries({ queryKey: ["tasks", boardId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          // console.log("Change received! (DELETE)", payload);
          queryClient.refetchQueries({ queryKey: ["tasks", boardId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, queryClient]);
};
