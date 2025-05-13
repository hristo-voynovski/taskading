import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

export const useTasksRealtime = (boardId: string) => {
  const queryClient = useQueryClient();
  console.log("In useTasksRealtime", boardId);
  console.log(`Change received at ${new Date().toLocaleTimeString()}`);

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
          console.log("Change received!", payload);
          queryClient.refetchQueries({ queryKey: ["tasks", boardId] });
          // queryClient.setQueryData(["tasks", boardId], (oldData: any) => {
          //   if (!oldData) return [payload.new];
          //   return [...oldData, payload.new];
          // });    OPTIONAL alternative for refetching 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, queryClient]);
};
