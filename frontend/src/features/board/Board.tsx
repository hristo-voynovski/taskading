import { act, use, useEffect, useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  closestCenter,
  PointerSensor,
} from "@dnd-kit/core";
import Column from "./components/Column";
import { TaskCardType, ColumnType } from "./types";
import { Button } from "@/components/ui/button";
import AddTask from "./components/AddTask";

const initialTasks: TaskCardType[] = [
  {
    id: "1",
    columnId: "todo",
    order: 1,
    title: "Sample Task 1",
    content: "This is the first sample task.",
    status: "todo",
  },
  {
    id: "2",
    columnId: "todo",
    order: 2,
    title: "Sample Task 2",
    content: "This is the second sample task.",
    status: "todo",
  },
  {
    id: "2",
    columnId: "todo",
    order: 2,
    title: "Sample Task 2",
    content: "This is the second sample task.",
    status: "todo",
  },
  {
    id: "2",
    columnId: "todo",
    order: 2,
    title: "Sample Task 2",
    content: "This is the second sample task.",
    status: "todo",
  },
  {
    id: "2",
    columnId: "todo",
    order: 2,
    title: "Sample Task 2",
    content: "This is the second sample task.",
    status: "todo",
  },
  {
    id: "3",
    columnId: "todo",
    order: 3,
    title: "Sample Task 3",
    content: "This is the third sample task.",
    status: "todo",
  },
  {
    id: "4",
    columnId: "done",
    order: 3,
    title: "Sample Task 3",
    content: "This is the third sample task.",
    status: "done",
  },
  {
    id: "5",
    columnId: "in-progress",
    order: 3,
    title: "Sample Task 3",
    content: "This is the third sample task.",
    status: "in-progress",
  },
  {
    id: "6",
    columnId: "done",
    order: 3,
    title: "Sample Task 3",
    content: "This is the third sample task.",
    status: "done",
  },
];

function Board() {
  const [tasks, setTasks] = useState<TaskCardType[]>(initialTasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddTask = (task: Omit<TaskCardType, "id" | "order">) => {
    const columnTasks = tasks.filter((t) => t.columnId === task.columnId);
    const newTask: TaskCardType = {
      ...task,
      id: String(tasks.length + 1),
      order: columnTasks.length + 1,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  return (
    <div className="mt-8 mb-16 flex flex-1 flex-col w-full h-full overflow-hidden">
      <div className="flex flex-row w-full items-center justify-center">
        <AddTask onSubmit={handleAddTask} />
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <div className="flex flex-row flex-1 w-full overflow-hidden justify-center gap-6">
          <Column
            column={{
              title: "To Do",
              type: "todo",
              tasks: tasks.filter((task) => task.status === "todo"),
            }}
          />
          <Column
            column={{
              title: "In Progress",
              type: "in-progress",
              tasks: tasks.filter((task) => task.status === "in-progress"),
            }}
          />
          <Column
            column={{
              title: "For Review",
              type: "for-review",
              tasks: tasks.filter((task) => task.status === "for-review"),
            }}
          />
          <Column
            column={{
              title: "Done",
              type: "done",
              tasks: tasks.filter((task) => task.status === "done"),
            }}
          />
        </div>
      </DndContext>
    </div>
  );
}

export default Board;
