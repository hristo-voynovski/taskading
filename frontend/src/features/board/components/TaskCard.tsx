import { TaskCardType } from "../types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskCardType;
  columnType: "todo" | "in-progress" | "for-review" | "done";
};

function TaskCard({ task, columnType }: TaskCardProps) {
  const cardStyles = {
    todo: "bg-blue-200 hover:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400",
    "in-progress":
      "bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-400",
    "for-review":
      "bg-purple-200 hover:bg-purple-300 dark:bg-purple-500 dark:hover:bg-purple-400",
    done: "bg-green-200 hover:bg-green-300 dark:bg-green-500 dark:hover:bg-green-400",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-3 mb-2 shadow-sm transition-colors duration-200 cursor-grab active:cursor-grabbing",
        cardStyles[columnType]
      )}
    >
      <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
      <p className="text-gray-700 mb-2 dark:text-gray-100">{task.content}</p>
      <div className="flex justify-end">
        <span className="text-xs font-medium px-2 py-1 rounded bg-white/50">
          {task.status}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;
