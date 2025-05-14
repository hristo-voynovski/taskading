import { supabase } from "@/lib/supabaseClient";
import { TaskCardType } from "../types";

export const updateTasks = async (
  tasks: TaskCardType[],
) => {
  const updates = tasks.map(({ id, columnId, position, title, content }) => ({
    id,
    column_id: columnId, // match DB column name
    position,
    title,
    content,
  }));
  console.log("[SUPABASE] Updating task positions");
  const { error } = await supabase.from("tasks").upsert(updates, {
    onConflict: "id",
  });

  if (error) {
    console.error("[SUPABASE] Failed to update task positions", error);
  } else {
    console.log("[SUPABASE] Task positions updated successfully");
  }
};
