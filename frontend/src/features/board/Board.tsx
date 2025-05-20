import { useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { useBoardDnD } from "./hooks/useBoardDnD";
import Column from "./components/Column";
import { TaskCardType, ColumnType } from "./types";
import AddTask from "./components/AddTask";
import { useBoard } from "./hooks/useBoard";
import { useTasksRealtime } from "./hooks/useTasksRealtime";
import { useColumns } from "./hooks/useColumns";
import { useAddTask } from "./hooks/useAddTask";

const boardId = "0dc87d56-0407-4569-bfe0-50e25778fc12";

function Board() {
  const { data, isLoading } = useBoard(boardId);
  const { data: columnData } = useColumns(boardId);
  useTasksRealtime(boardId);
  const [columns, setColumns] = useState<ColumnType[]>([]);
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

  const { sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useBoardDnD(columns, setColumns);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<TaskCardType["status"]>("todo");

  const handleColumnAddClick = (status: TaskCardType["status"]) => {
    console.log("handleColumnAddClick", status);
    setSelectedStatus(status);
    setAddDialogOpen(true);
  };

  const handleAddTask = useAddTask(boardId, setColumns);

  return (
    <div className="mt-8 mb-16 flex flex-1 flex-col w-full h-full overflow-hidden">
      <div className="flex flex-row w-full items-center justify-center">
        <AddTask
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={handleAddTask}
          initialStatus={selectedStatus}
        />
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
              onAddClick={() => handleColumnAddClick(column.type)}
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
