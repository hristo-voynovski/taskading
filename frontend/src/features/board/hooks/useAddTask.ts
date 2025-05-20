import { useCallback } from "react";
import { createTask } from "../queries/createTask";
import { TaskCardType, ColumnType } from "../types";

export function useAddTask(boardId: string, setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>) {
  const handleAddTask = useCallback(
    async (task: Omit<TaskCardType, "id" | "position">) => {
      try {
        const newTask = await createTask({
          ...task,
          boardId, 
        });
        setColumns((prev) =>
          prev.map((col) =>
            col.type === newTask.status
              ? {
                  ...col,
                  tasks: [
                    ...col.tasks,
                    { ...newTask, position: col.tasks.length + 1 },
                  ],
                }
              : col
          )
        );
      } catch (err) {
        console.error("Failed to create task", err);
      }
    },
    [boardId, setColumns]
  );
  return handleAddTask;
}
