import { useState } from "react";
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

const boardId = "0dc87d56-0407-4569-bfe0-50e25778fc12";

function Board() {
  const { data, isLoading } = useBoard(boardId);
  console.log("tasks", data);
  console.log("isLoading", isLoading);

  const [columns, setColumns] = useState<ColumnType[]>([
    {
      title: "To Do",
      type: "todo",
      tasks: [
        {
          id: "1",
          columnId: "todo",
          position: 1,
          title: "Plan project",
          content: "Outline the project requirements and deliverables.",
          status: "todo",
        },
        {
          id: "2",
          columnId: "todo",
          position: 2,
          title: "Set up repo",
          content: "Initialize git repository and setup project structure.",
          status: "todo",
        },
        {
          id: "3",
          columnId: "todo",
          position: 3,
          title: "Install dependencies",
          content: "Install all required npm packages.",
          status: "todo",
        },
      ],
    },
    {
      title: "In Progress",
      type: "in-progress",
      tasks: [
        {
          id: "4",
          columnId: "in-progress",
          position: 1,
          title: "Develop UI",
          content: "Work on the main user interface components.",
          status: "in-progress",
        },
        {
          id: "5",
          columnId: "in-progress",
          position: 2,
          title: "Implement drag & drop",
          content: "Add drag and drop functionality for tasks.",
          status: "in-progress",
        },
      ],
    },
    {
      title: "For Review",
      type: "for-review",
      tasks: [
        {
          id: "6",
          columnId: "for-review",
          position: 1,
          title: "Code review",
          content: "Review the code for best practices and bugs.",
          status: "for-review",
        },
        {
          id: "7",
          columnId: "for-review",
          position: 2,
          title: "Test features",
          content: "Test all implemented features for correctness.",
          status: "for-review",
        },
      ],
    },
    {
      title: "Done",
      type: "done",
      tasks: [
        {
          id: "8",
          columnId: "done",
          position: 1,
          title: "Initial commit",
          content: "Pushed the initial commit to the repository.",
          status: "done",
        },
        {
          id: "9",
          columnId: "done",
          position: 2,
          title: "Setup CI/CD",
          content: "Configured continuous integration and deployment.",
          status: "done",
        },
      ],
    },
  ]);

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

    // Find the task that's being dragged
    const draggedTask = columns
      .map((col) => col.tasks)
      .flat()
      .find((task) => task.id === id);

    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

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

        return newColumns;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active task
    setActiveTask(null);

    // If no over target, just return
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If items are the same, no need to do anything
    if (activeId === overId) return;

    // Find all tasks
    const allTasks = columns.map((col) => col.tasks).flat();

    // Find the tasks we're working with
    const activeTask = allTasks.find((task) => task.id === activeId);
    const overTask = allTasks.find((task) => task.id === overId);

    // If we can't find the active task, return
    if (!activeTask) return;

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
        if (sourceColumnIndex === -1 || destColumnIndex === -1)
          return prevColumns;
        const sourceColumn = prevColumns[sourceColumnIndex];
        const destColumn = prevColumns[destColumnIndex];
        const updatedSourceTasks = sourceColumn.tasks.filter(
          (task) => task.id !== activeId
        );
        const updatedTask = {
          ...activeTask,
          columnId: overColumn.type,
          status: overColumn.type,
        };
        const updatedDestTasks = [...destColumn.tasks, updatedTask];
        const newColumns = [...prevColumns];
        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          tasks: updatedSourceTasks.map((task, idx) => ({
            ...task,
            position: idx + 1,
          })),
        };
        newColumns[destColumnIndex] = {
          ...destColumn,
          tasks: updatedDestTasks.map((task, idx) => ({
            ...task,
            position: idx + 1,
          })),
        };
        return newColumns;
      });
      return;
    }

    // If we can't find either task, return
    if (!overTask) return;

    // Handle reordering within the same column
    if (activeTask.columnId === overTask.columnId) {
      setColumns((prevColumns) => {
        // Find the column index
        const columnIndex = prevColumns.findIndex(
          (col) => col.type === activeTask.columnId
        );

        if (columnIndex === -1) return prevColumns;

        const column = prevColumns[columnIndex];

        // Find indices for the active and over tasks
        const activeIndex = column.tasks.findIndex(
          (task) => task.id === activeId
        );
        const overIndex = column.tasks.findIndex((task) => task.id === overId);

        // Create new columns with the reordered tasks
        const newColumns = [...prevColumns];
        newColumns[columnIndex] = {
          ...column,
          tasks: arrayMove(column.tasks, activeIndex, overIndex).map(
            (task, idx) => ({
              ...task,
              position: idx + 1, // Update position based on new position
            })
          ),
        };

        return newColumns;
      });
    } else {
      // This is a fallback - the task should have already been moved in handleDragOver
      // But we'll handle the case where a task is moved to a different column here too
      setColumns((prevColumns) => {
        // Find indices for source and destination columns
        const sourceColumnIndex = prevColumns.findIndex(
          (col) => col.type === activeTask.columnId
        );
        const destColumnIndex = prevColumns.findIndex(
          (col) => col.type === overTask.columnId
        );

        if (sourceColumnIndex === -1 || destColumnIndex === -1)
          return prevColumns;

        // Remove task from source column
        const sourceColumn = prevColumns[sourceColumnIndex];
        const destColumn = prevColumns[destColumnIndex];

        const updatedSourceTasks = sourceColumn.tasks.filter(
          (task) => task.id !== activeId
        );

        // Find the position in the destination column
        const overTaskIndex = destColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        // Create new task with updated properties
        const updatedTask = {
          ...activeTask,
          columnId: overTask.columnId,
          status: overTask.status,
        };

        // Insert task into destination column at the right position
        const updatedDestTasks = [...destColumn.tasks];
        updatedDestTasks.splice(overTaskIndex + 1, 0, updatedTask);

        // Create new columns array with updated columns
        const newColumns = [...prevColumns];
        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          tasks: updatedSourceTasks.map((task, idx) => ({
            ...task,
            position: idx + 1, // Update position in source column
          })),
        };

        newColumns[destColumnIndex] = {
          ...destColumn,
          tasks: updatedDestTasks.map((task, idx) => ({
            ...task,
            position: idx + 1, // Update position in destination column
          })),
        };

        return newColumns;
      });
    }
  };

  const handleAddTask = (task: Omit<TaskCardType, "id" | "position">) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      position:
        columns.find((col) => col.type === task.columnId)?.tasks.length || 0, //0 for position could be problematic for reordering tasks
    };
    setColumns((prev) =>
      prev.map((col) => {
        if (col.type === task.columnId) {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }
        return col;
      })
    );
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
          <Column
            key="todo"
            column={{
              title: "To Do",
              type: "todo",
              tasks: data?.filter((task) => task.status === "todo")?.map(task => ({ ...task, position: task.position })) || [],
              //match type to column in sql somehow - check tomorrow
            }}
          ></Column>
          <Column
            key="in-progress"
            column={{
              title: "In Progress",
              type: "in-progress",
              tasks:
                data?.filter((task) => task.status === "in-progress")?.map(task => ({ ...task, position: task.position })) || [],
              //match type to column in sql somehow - check tomorrow
            }}
          ></Column>
          <Column
            key="for-review"
            column={{
              title: "For Review",
              type: "for-review",
              tasks: data?.filter((task) => task.status === "for-review")?.map(task => ({ ...task, position: task.position })) || [],
              //match type to column in sql somehow - check tomorrow
            }}
          ></Column>
          <Column
            key="done"
            column={{
              title: "Done",
              type: "done",
              tasks: data?.filter((task) => task.status === "done")?.map(task => ({ ...task, position: task.position })) || [],
              //match type to column in sql somehow - check tomorrow
            }}
          ></Column>
        </div>
      </DndContext>
    </div>
  );
}

export default Board;
