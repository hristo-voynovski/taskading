import { act, use, useEffect, useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  closestCenter,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import Column from "./components/Column";
import { TaskCardType, ColumnType } from "./types";
import { Button } from "@/components/ui/button";
import AddTask from "./components/AddTask";

function Board() {
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      title: "To Do",
      type: "todo",
      tasks: [
        {
          id: "1",
          columnId: "todo",
          order: 1,
          title: "Plan project",
          content: "Outline the project requirements and deliverables.",
          status: "todo",
        },
        {
          id: "2",
          columnId: "todo",
          order: 2,
          title: "Set up repo",
          content: "Initialize git repository and setup project structure.",
          status: "todo",
        },
        {
          id: "3",
          columnId: "todo",
          order: 3,
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
          order: 1,
          title: "Develop UI",
          content: "Work on the main user interface components.",
          status: "in-progress",
        },
        {
          id: "5",
          columnId: "in-progress",
          order: 2,
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
          order: 1,
          title: "Code review",
          content: "Review the code for best practices and bugs.",
          status: "for-review",
        },
        {
          id: "7",
          columnId: "for-review",
          order: 2,
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
          order: 1,
          title: "Initial commit",
          content: "Pushed the initial commit to the repository.",
          status: "done",
        },
        {
          id: "9",
          columnId: "done",
          order: 2,
          title: "Setup CI/CD",
          content: "Configured continuous integration and deployment.",
          status: "done",
        },
      ],
    },
  ]);
  // const [tasks, setTasks] = useState<TaskCardType[]>(initialTasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setColumns((prev) => {
      const activeTaskId = active.id as string;
      const overTaskId = over.id as string;

      const sourceColumnIndex = prev.findIndex((col) =>
        col.tasks.some((task) => task.id === activeTaskId)
      );

      const targetColumnIndex = prev.findIndex((col) =>
        col.tasks.some((task) => task.id === overTaskId)
      );

      if (sourceColumnIndex === -1 || targetColumnIndex === -1) return prev;

      const sourceCol = { ...prev[sourceColumnIndex] };
      const targetCol = { ...prev[targetColumnIndex] };

      const taskIndex = sourceCol.tasks.findIndex(
        (task) => task.id === activeTaskId
      );
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      if (sourceCol.type !== targetCol.type) {
        movedTask.columnId = targetCol.type;
        movedTask.status = targetCol.type;
      }

      const overTaskIndex = targetCol.tasks.findIndex(
        (task) => task.id === overTaskId
      );

      const insertAt =
        overTaskIndex >= 0 ? overTaskIndex : targetCol.tasks.length;

      targetCol.tasks.splice(insertAt, 0, movedTask);

      const newColumns = [...prev];
      newColumns[sourceColumnIndex] = sourceCol;
      newColumns[targetColumnIndex] = targetCol;

      return newColumns;
    });
  };

  const handleAddTask = (task: Omit<TaskCardType, "id" | "order">) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      order:
        columns.find((col) => col.type === task.columnId)?.tasks.length || 0, //0 for order could be problematic for reordering tasks
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-row flex-1 w-full overflow-hidden justify-center gap-6">
          {columns.map((column) => (
            <Column
              key={column.type}
              column={{
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
