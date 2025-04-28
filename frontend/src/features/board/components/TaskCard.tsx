import { TaskCardType } from "../types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskCardType;
  columnType: "todo" | "in-progress" | "for-review" | "done";
};

function TaskCard({ task, columnType }: TaskCardProps) {
  const cardStyles = {
    todo: "bg-blue-100 hover:bg-blue-200",
    "in-progress": "bg-yellow-100 hover:bg-yellow-200",
    "for-review": "bg-purple-100 hover:bg-purple-200",
    done: "bg-green-100 hover:bg-green-200"
  };

  return (
    <div className={cn(
      "rounded-lg p-3 mb-2 shadow-sm transition-colors duration-200",
      cardStyles[columnType]
    )}>
      <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
      <p className="text-gray-700 mb-2">{task.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">ID: {task.id}</span>
        <span className="text-xs font-medium px-2 py-1 rounded bg-white/50">
          {task.status}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;
