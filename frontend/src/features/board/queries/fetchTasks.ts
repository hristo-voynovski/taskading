import { supabase } from "@/lib/supabaseClient";
import { TaskCardType } from "../types";

export const fetchTasks = async (boardId: string): Promise<TaskCardType[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, columns!inner(id, board_id, name)")
    .eq("columns.board_id", boardId);
  if (error) {
    throw new Error(error.message);
  }

  return data?.map((task) => ({
    id: task.id,
    columnId: task.column_id,
    position: task.position,
    title: task.title,
    content: task.content,
    status: task.columns.name,
  })) ?? [];
};
