import { ColumnType } from "../types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskCard";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ColumnProps = {
  column: ColumnType;
  onAddClick: () => void;
};

function Column({ column, onAddClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.columnId,
    data: { type: "column" },
  });

  const columnStyles = {
    todo: "bg-blue-100 dark:bg-blue-700 border-blue-200 dark:border-blue-600",
    "in-progress":
      "bg-yellow-100 dark:bg-yellow-700 border-yellow-200 dark:border-yellow-600",
    "for-review":
      "bg-purple-100 dark:bg-purple-700 border-purple-200 dark:border-purple-600",
    done: "bg-green-100 dark:bg-green-700 border-green-200 dark:border-green-600",
  };

  const buttonStyles = {
    todo: "bg-blue-200 hover:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400",
    "in-progress":
      "bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-400",
    "for-review":
      "bg-purple-200 hover:bg-purple-300 dark:bg-purple-500 dark:hover:bg-purple-400",
    done: "bg-green-200 hover:bg-green-300 dark:bg-green-500 dark:hover:bg-green-400",
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[280px] max-w-[340px] m-2 rounded-lg border-2",
        columnStyles[column.type],
        isOver && "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400"
      )}
    >
      <div className="flex items-start justify-between p-4">
        <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
        <Button className={buttonStyles[column.type]} size="icon" onClick={onAddClick}>
          <Plus className="text-black dark:text-white" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar scroll-smooth p-4">
        <SortableContext
          id={column.type}
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        <div className="h-8"></div>
      </div>
    </div>
  );
}

export default Column;
