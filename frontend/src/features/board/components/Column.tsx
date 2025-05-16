import { ColumnType } from "../types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTaskCard from "./SortableTaskCard";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

type ColumnProps = {
  column: ColumnType;
};

function Column({ column }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.columnId,
    data: { type: "column"},
  });

  const columnStyles = {
    todo: "bg-blue-100 dark:bg-blue-700 border-blue-200 dark:border-blue-600",
    "in-progress":
      "bg-yellow-100 dark:bg-yellow-700 border-yellow-200 dark:border-yellow-600",
    "for-review":
      "bg-purple-100 dark:bg-purple-700 border-purple-200 dark:border-purple-600",
    done: "bg-green-100 dark:bg-green-700 border-green-200 dark:border-green-600",
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[280px] max-w-[340px] m-2 rounded-lg border-2 p-4 overflow-y-auto overflow-x-hidden scrollbar scroll-smooth",
        columnStyles[column.type],
        isOver && "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400"
      )}
    >
      <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
      <div className="flex-1">
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
