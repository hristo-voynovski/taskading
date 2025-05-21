import { supabase } from "@/lib/supabaseClient";
import { TaskCardType } from "../types";

export const updateTasks = async (
  tasks: TaskCardType[],
) => {
  const updates = tasks.map(({ id, columnId, position, title, content }) => ({
    id,
    column_id: columnId, 
    position,
    title,
    content,
  }));
  const { error } = await supabase.from("tasks").upsert(updates, {
    onConflict: "id",
  });

  if (error) {
   throw new Error(error.message);
  }
};
