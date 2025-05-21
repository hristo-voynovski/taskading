import { supabase } from "@/lib/supabaseClient";

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);
  if (error) throw error;
}
