import { supabase } from "@/lib/supabaseClient";
import { ColumnType } from "../types";
//Omit title and tasks from ColumnType
export const fetchColumns = async (boardId: string): Promise<Omit<ColumnType, "title" | "tasks">[]> => {
  // Fetch columns from the database using Supabase
  // console.log("Fetching columns for boardId:", boardId);  
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId);

  if (error) {
    throw error;
  }

  // Returns an array of column ids
  return data?.map((col) => ({
    columnId: col.id,
    type:col.name,
    boardId: col.board_id,
  }));
}
