import { supabase } from "@/lib/supabaseClient";
import { TaskCardType } from "../types";

type NewTask = Omit<TaskCardType, "id" | "position"> & { boardId: string };

export const createTask = async (task: NewTask) => {
    console.log(task)
    // Step 1: Find column_id for the given board and status
  const { data: columnData, error: columnError } = await supabase
    .from("columns")
    .select("id")
    .eq("board_id", task.boardId)
    .eq("name", task.status) // use mapped name
    .single();

  if (columnError || !columnData) {
    throw new Error(`Could not find column for status "${status}": ${columnError?.message}`);
  }

  const columnId = columnData.id;

  // Step 2: Get current max position in this column
  const { data: maxResult, error: maxError } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);

  if (maxError) {
    throw new Error(`Error fetching max position: ${maxError.message}`);
  }

  const maxPosition = maxResult?.[0]?.position ?? -1;
  const newPosition = maxPosition + 1;

  // Step 3: Insert task
  const { data: taskData, error: insertError } = await supabase
    .from("tasks")
    .insert([
      {
        title: task.title,
        content: task.content,
        column_id: columnId,
        position: newPosition,
      },
    ])
    .select("*, columns(name)")
    .single();

  if (insertError) {
    throw new Error(`Error inserting task: ${insertError.message}`);
  }

  return {
    ...taskData,
    status: taskData.columns.name, // return the human-readable status
  };
};