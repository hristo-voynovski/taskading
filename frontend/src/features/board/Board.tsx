import { useEffect, useState } from "react";
import Column from "./components/Column";
import { TaskCardType, ColumnType } from "./types";

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

  return (
    <div className="flex flex-row flex-1 h-full w-full overflow-hidden justify-center gap-6">
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
  );
}

export default Board;
