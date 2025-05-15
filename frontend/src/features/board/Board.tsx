import { useState, useEffect, useRef } from "react";
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
import { useColumns } from "./hooks/useColumns";

const boardId = "0dc87d56-0407-4569-bfe0-50e25778fc12";

function Board() {
  const { data, isLoading } = useBoard(boardId);
  const { data: columnData } = useColumns(boardId);
  // console.log("columnData", columnData);
  // const { taskQuery, columnQuery } = useBoard(boardId);
  // const data = taskQuery.data;
  // console.log(columnQuery)
  // const columnData = columnQuery.data; // Add real-time updates for tasks
  useTasksRealtime(boardId);
  // console.log("tasks", data);
  // console.log("isLoading", isLoading);
  // console.log("data", data);
  // console.log("columnData", columnData);

  const draggedFromColumnId = useRef<string | null>(null);

  const [columns, setColumns] = useState<ColumnType[]>([]);

  // console.log(columnData?.map((col) => col.type === "todo"));

  useEffect(() => {
    // console.log("In useEffect row 33");
    if (!data || !columnData) return;
    setColumns([
      {
        title: "To Do",
        type: "todo",
        columnId:
          columnData?.find((col) => col.type === "todo")?.columnId ??
          "Column ID not found",
        tasks: data
          .filter((task) => task.status === "todo")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "In Progress",
        type: "in-progress",
        columnId:
          columnData?.find((col) => col.type === "in-progress")?.columnId ??
          "Column ID not found",
        tasks: data
          .filter((task) => task.status === "in-progress")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "For Review",
        type: "for-review",
        columnId:
          columnData?.find((col) => col.type === "for-review")?.columnId ??
          "Column ID not found",
        tasks: data
          .filter((task) => task.status === "for-review")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
      {
        title: "Done",
        type: "done",
        columnId:
          columnData?.find((col) => col.type === "done")?.columnId ??
          "Column ID not found",
        tasks: data
          .filter((task) => task.status === "done")
          .sort((a, b) => a.position - b.position)
          .map((task) => ({ ...task, position: task.position })),
      },
    ]);
  }, [data, columnData]);

  // console.log("columns", columns);
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
      draggedFromColumnId.current = draggedTask.columnId;
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
    console.log("activeId", activeId, "overId", overId);
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
    const overColumn = columns.find((col) => col.columnId === overId);
    console.log("overColumn", overColumn);
    console.log(" In overempty column check");
    if (!!overColumn && activeTask.columnId !== overColumn.columnId) {
      console.log("Moving to empty column in handleDragOver");
      setColumns((prevColumns) => {
        const sourceColumnIndex = prevColumns.findIndex(
          (col) => col.columnId === activeTask.columnId
        );
        const destColumnIndex = prevColumns.findIndex(
          (col) => col.columnId === overColumn.columnId
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
          columnId: overColumn.columnId,
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
      console.log("Moving between columns via task");
      setColumns((prevColumns) => {
        // Find the source and destination column indexes
        const sourceColumnIndex = prevColumns.findIndex(
          (col) => col.columnId === activeTask.columnId
        );
        const destColumnIndex = prevColumns.findIndex(
          (col) => col.columnId === overTask.columnId
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
        console.log("updatedDestTasks", updatedDestTasks);
        console.log("updatedSourceTasks", updatedSourceTasks);
        console.log("In handleDragOver");
        return newColumns;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Dragged from column:", draggedFromColumnId.current);
    console.log("Dropped over:", over?.id);
    setActiveTask(null);

    // if (!over) {
    //   console.log("No over element");
    //   return;
    // }

    // const activeId = active.id as string;
    // const overId = over.id as string;

    // if (activeId === overId) {
    //   console.log("Dropped on the same element");
    //   return;
    // }

    if (!over) {
      console.log("No over element");
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const isDroppingIntoColumn = columns.some((col) => col.columnId === overId);

    if (isDroppingIntoColumn) {
      const activeTask = columns
        .flatMap((col) => col.tasks)
        .find((t) => t.id === activeId);
      const overColumn = columns.find((col) => col.columnId === overId);
      const sourceColumn = columns.find(
        (col) => col.columnId === activeTask?.columnId
      );
      console.log("Dropping onto column", overId);
      console.log("Found activeTask:", activeTask);
      console.log("Found overColumn:", overColumn);
      console.log("Found sourceColumn:", sourceColumn);
      if (!activeTask || !overColumn || !sourceColumn) {
        draggedFromColumnId.current = null;
        return;
      }

      console.log("Moving to empty column in handleDragEnd");

      const updatedSourceTasks = sourceColumn.tasks
        .filter((t) => t.id !== activeTask.id)
        .map((t, i) => ({ ...t, position: i + 1 }));

      const updatedTask = {
        ...activeTask,
        columnId: overColumn.columnId,
        status: overColumn.type,
      };

      const updatedDestTasks = [...overColumn.tasks, updatedTask].map(
        (t, i) => ({
          ...t,
          position: i + 1,
        })
      );

      const newColumns = columns.map((col) => {
        if (col.columnId === sourceColumn.columnId) {
          return { ...col, tasks: updatedSourceTasks };
        }
        if (col.columnId === overColumn.columnId) {
          return { ...col, tasks: updatedDestTasks };
        }
        return col;
      });

      const updatedTasks = newColumns.flatMap((col) => col.tasks);
      setColumns(newColumns);
      updateTasks(updatedTasks);
      draggedFromColumnId.current = null;
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

    const overColumn = columns.find((col) => col.columnId === overId);
    if (overColumn && activeTask.columnId !== overColumn.columnId) {
      console.log("Moving to a different column over column header");
      setColumns((prevColumns) => {
        const sourceIndex = prevColumns.findIndex(
          (c) => c.columnId === activeTask.columnId
        );
        const destIndex = prevColumns.findIndex(
          (c) => c.columnId === overColumn.columnId
        );
        if (sourceIndex === -1 || destIndex === -1) return prevColumns;

        const sourceCol = prevColumns[sourceIndex];
        const destCol = prevColumns[destIndex];
        const movedTask = {
          ...activeTask,
          columnId: overColumn.columnId,
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
          (col) => col.columnId === activeTask.columnId //managed to fix moving columns
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
          (c) => c.columnId === activeTask.columnId
        );
        const destIndex = prevColumns.findIndex(
          (c) => c.columnId === overTask.columnId
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
