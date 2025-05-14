import { useState, useEffect } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  closestCorners,
  PointerSensor,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./components/Column";
import { TaskCardType, ColumnType } from "./types";
import AddTask from "./components/AddTask";
import { useBoard } from "./hooks/useBoard";
import { createTask } from "./queries/createTask"; // <-- import your API
import { useTasksRealtime } from "./hooks/useTasksRealtime"; // <-- import the hook
import { updateTasks } from "./queries/updateTasks";

const boardId = "0dc87d56-0407-4569-bfe0-50e25778fc12";

function Board() {
  const { data, isLoading } = useBoard(boardId);
  // Add real-time updates for tasks
  useTasksRealtime(boardId);
  // console.log("tasks", data);
  // console.log("isLoading", isLoading);

  const [columns, setColumns] = useState<ColumnType[]>([]);

  useEffect(() => {
    // console.log("In useEffect row 33");
    if (!data) return;
    setColumns([
      {
        title: "To Do",
        type: "todo",
        columnId:
          data.find((task) => task.status === "todo")?.columnId ?? "todo",
        tasks: data
          .filter((task) => task.status === "todo")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "In Progress",
        type: "in-progress",
        columnId:
          data.find((task) => task.status === "in-progress")?.columnId ??
          "in-progress",
        tasks: data
          .filter((task) => task.status === "in-progress")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "For Review",
        type: "for-review",
        columnId:
          data.find((task) => task.status === "for-review")?.columnId ??
          "for-review",
        tasks: data
          .filter((task) => task.status === "for-review")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "Done",
        type: "done",
        columnId:
          data.find((task) => task.status === "done")?.columnId ?? "done",
        tasks: data
          .filter((task) => task.status === "done")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
    ]);
  }, [data]);

  // Track the active task being dragged
  const [activeTask, setActiveTask] = useState<TaskCardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    console.log("[DND] Drag Start - Task ID:", id);
    // Find the task that's being dragged
    const draggedTask = columns
      .map((col) => col.tasks)
      .flat()
      .find((task) => task.id === id);

    if (draggedTask) {
      setActiveTask(draggedTask);
      console.log("[DND] Drag Start - Task Data:", draggedTask);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log(
      "[DND] Drag Over - Active ID:",
      active.id,
      "Over ID:",
      over?.id
    );

    // If no over target or tasks are the same, skip
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find all tasks to work with column data
    const allTasks = columns.map((col) => col.tasks).flat();

    // Find the tasks we're working with
    const activeTask = allTasks.find((task) => task.id === activeId);
    const overTask = allTasks.find((task) => task.id === overId);

    // If we can't find the active task, return early
    if (!activeTask) {
      return;
    }

    // Check if over target is a column (for empty columns)
    const overColumn = columns.find((col) => col.type === overId);
    if (overColumn && activeTask.columnId !== overColumn.type) {
      setColumns((prevColumns) => {
        const sourceColumnIndex = prevColumns.findIndex(
          (col) => col.type === activeTask.columnId
        );
        const destColumnIndex = prevColumns.findIndex(
          (col) => col.type === overColumn.type
        );
        if (sourceColumnIndex === -1 || destColumnIndex === -1) {
          return prevColumns;
        }
        const newColumns = [...prevColumns];
        // Remove from source
        const updatedSourceTasks = newColumns[sourceColumnIndex].tasks.filter(
          (task) => task.id !== activeTask.id
        );
        // Update task for new column
        const updatedTask = {
          ...activeTask,
          columnId: overColumn.type,
          status: overColumn.type,
        };
        // Insert as first task in empty column
        const updatedDestTasks = [
          ...newColumns[destColumnIndex].tasks,
          updatedTask,
        ];
        newColumns[sourceColumnIndex] = {
          ...newColumns[sourceColumnIndex],
          tasks: updatedSourceTasks,
        };
        newColumns[destColumnIndex] = {
          ...newColumns[destColumnIndex],
          tasks: updatedDestTasks,
        };
        return newColumns;
      });
      return;
    }

    // If we can't find the over task, return early
    if (!overTask) {
      return;
    }

    // If tasks are in different columns, we need to move the task between columns
    if (activeTask.columnId !== overTask.columnId) {
      setColumns((prevColumns) => {
        // Find the source and destination column indexes
        const sourceColumnIndex = prevColumns.findIndex(
          (col) => col.type === activeTask.columnId
        );
        const destColumnIndex = prevColumns.findIndex(
          (col) => col.type === overTask.columnId
        );

        // If we can't find either column, do nothing
        if (sourceColumnIndex === -1 || destColumnIndex === -1) {
          return prevColumns;
        }

        // Create a copy of columns to modify
        const newColumns = [...prevColumns];

        // Remove task from source column
        const updatedSourceTasks = newColumns[sourceColumnIndex].tasks.filter(
          (task) => task.id !== activeTask.id
        );

        // Create updated task with new columnId and status
        const updatedTask = {
          ...activeTask,
          columnId: overTask.columnId,
          status: overTask.status,
        };

        // Find the index where to insert in destination column
        const overTaskIndex = newColumns[destColumnIndex].tasks.findIndex(
          (task) => task.id === overTask.id
        );

        // Insert task into destination column
        const updatedDestTasks = [...newColumns[destColumnIndex].tasks];
        updatedDestTasks.splice(overTaskIndex + 1, 0, updatedTask);

        // Update both columns
        newColumns[sourceColumnIndex] = {
          ...newColumns[sourceColumnIndex],
          tasks: updatedSourceTasks,
        };

        newColumns[destColumnIndex] = {
          ...newColumns[destColumnIndex],
          tasks: updatedDestTasks,
        };
        console.log("In handleDragOver");
        return newColumns;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      console.log("No over element");
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      console.log("Dropped on the same element");
      return;
    }

    const allTasks = columns.map((col) => col.tasks).flat();
    const activeTask = allTasks.find((task) => task.id === activeId);
    const overTask = allTasks.find((task) => task.id === overId);
    console.log("activeTask", activeTask, "overTask", overTask);

    if (!activeTask) {
      console.log("No active task found");
      return;
    }

    const overColumn = columns.find((col) => col.type === overId);
    if (overColumn && activeTask.columnId !== overColumn.type) {
      console.log("Moving to a different column over column header");
      setColumns((prevColumns) => {
        const sourceIndex = prevColumns.findIndex(
          (c) => c.type === activeTask.columnId
        );
        const destIndex = prevColumns.findIndex(
          (c) => c.type === overColumn.type
        );
        if (sourceIndex === -1 || destIndex === -1) return prevColumns;

        const sourceCol = prevColumns[sourceIndex];
        const destCol = prevColumns[destIndex];
        const movedTask = {
          ...activeTask,
          columnId: overColumn.type,
          status: overColumn.type,
        };

        const updatedSource = sourceCol.tasks
          .filter((t) => t.id !== activeId)
          .map((t, i) => ({ ...t, position: i + 1 }));

        const updatedDest = [...destCol.tasks, movedTask].map((t, i) => ({
          ...t,
          position: i + 1,
        }));

        const newColumns = [...prevColumns];
        newColumns[sourceIndex] = { ...sourceCol, tasks: updatedSource };
        newColumns[destIndex] = { ...destCol, tasks: updatedDest };

        const updatedTasks = newColumns.flatMap((col) => col.tasks);
        updateTasks(updatedTasks);

        return newColumns;
      });
      return;
    }

    if (!overTask) {
      console.log("No over element");
      return;
    }

    if (activeTask.columnId === overTask.columnId) {
      console.log("Moving within the same column");
      console.log("prevColumns", columns);
      console.log("activeTask", activeTask);
      setColumns((prevColumns) => {
        const columnIndex = prevColumns.findIndex(
          (col) => col.columnId === activeTask.columnId  //managed to fix moving columns
        );
        console.log("columnIndex", columnIndex);
        if (columnIndex === -1) return prevColumns;

        const column = prevColumns[columnIndex];
        const activeIndex = column.tasks.findIndex(
          (task) => task.id === activeId
        );
        const overIndex = column.tasks.findIndex((task) => task.id === overId);

        const reorderedTasks = arrayMove(
          column.tasks,
          activeIndex,
          overIndex
        ).map((t, i) => ({ ...t, position: i + 1 }));

        const newColumns = [...prevColumns];
        newColumns[columnIndex] = { ...column, tasks: reorderedTasks };

        const updatedTasks = newColumns.flatMap((col) => col.tasks);
        console.log("updatedTasks", updatedTasks);
        updateTasks(updatedTasks);

        return newColumns;
      });
    } else {
      console.log("Moving between columns via task");

      setColumns((prevColumns) => {
        const sourceIndex = prevColumns.findIndex(
          (c) => c.type === activeTask.columnId
        );
        const destIndex = prevColumns.findIndex(
          (c) => c.type === overTask.columnId
        );
        if (sourceIndex === -1 || destIndex === -1) return prevColumns;

        const sourceCol = prevColumns[sourceIndex];
        const destCol = prevColumns[destIndex];
        const movedTask = {
          ...activeTask,
          columnId: overTask.columnId,
          status: overTask.status,
        };

        const updatedSource = sourceCol.tasks
          .filter((t) => t.id !== activeId)
          .map((t, i) => ({ ...t, position: i + 1 }));

        const overIndex = destCol.tasks.findIndex((t) => t.id === overId);
        const updatedDest = [...destCol.tasks];
        updatedDest.splice(overIndex + 1, 0, movedTask);

        const normalizedDest = updatedDest.map((t, i) => ({
          ...t,
          position: i + 1,
        }));

        const newColumns = [...prevColumns];
        newColumns[sourceIndex] = { ...sourceCol, tasks: updatedSource };
        newColumns[destIndex] = { ...destCol, tasks: normalizedDest };

        const updatedTasks = newColumns.flatMap((col) => col.tasks);
        updateTasks(updatedTasks);

        return newColumns;
      });
    }
  };

  // console.log("columns", columns);
  // console.log("data", data);
  const handleAddTask = async (task: Omit<TaskCardType, "id" | "position">) => {
    try {
      // Call your API to create the task in the backend
      const newTask = await createTask({
        ...task,
        boardId, // make sure boardId is included
        // position: (columns.find(col => col.type === task.status)?.tasks.length ?? 0) + 1,
      });

      // Add the new task to the correct column in the UI
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
      // Optionally handle error (show toast, etc.)
      console.error("Failed to create task", err);
    }
  };

  return (
    <div className="mt-8 mb-16 flex flex-1 flex-col w-full h-full overflow-hidden">
      <div className="flex flex-row w-full items-center justify-center">
        <AddTask onSubmit={handleAddTask} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-row flex-1 w-full overflow-hidden justify-center gap-6">
          {columns.map((column) => (
            <Column
              key={column.type}
              column={{
                columnId: column.columnId,
                title: column.title,
                type: column.type,
                tasks: column.tasks,
              }}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default Board;
