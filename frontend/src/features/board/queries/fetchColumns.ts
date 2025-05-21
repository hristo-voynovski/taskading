import { supabase } from "@/lib/supabaseClient";
import { ColumnType } from "../types";

export const fetchColumns = async (boardId: string): Promise<Omit<ColumnType, "title" | "tasks">[]> => {
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId);

  if (error) {
    throw error;
  }

  return data?.map((col) => ({
    columnId: col.id,
    type:col.name,
    boardId: col.board_id,
  }));
}
