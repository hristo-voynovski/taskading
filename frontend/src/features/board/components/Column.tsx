import { ColumnType } from "../types";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";

type ColumnProps = {
  column: ColumnType;
};

function Column({ column }: ColumnProps) {
  const columnStyles = {
    "todo": "bg-blue-50 border-blue-200",
    "in-progress": "bg-yellow-50 border-yellow-200",
    "for-review": "bg-purple-50 border-purple-200",
    "done": "bg-green-50 border-green-200"
  };

  return (
    <div className={cn(
      "flex flex-col flex-1 min-w-[280px] max-w-[340px] m-2 rounded-lg border-2 p-4 mt-16 mb-16",
      columnStyles[column.type]
    )}>
      <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
      <div className="flex-1 overflow-y-auto">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnType={column.type} />
        ))}
      </div>
    </div>
  );
}

export default Column;
