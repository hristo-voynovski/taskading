import { supabase } from "@/lib/supabaseClient";
import { TaskCardType } from "../types";

export const fetchTasks = async (boardId: string): Promise<TaskCardType[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, columns!inner(id, board_id)")
    .eq("columns.board_id", boardId);

  if (error) {
    throw new Error(error.message);
  }

  // If you want only the tasks fields, you may want to map data to strip the columns property
  // return data?.map(({ columns, ...task }) => task) ?? [];
  return data;
};
