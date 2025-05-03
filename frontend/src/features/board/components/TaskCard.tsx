import { TaskCardType } from "../types";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";

type TaskCardProps = {
  task: TaskCardType;
  columnType: "todo" | "in-progress" | "for-review" | "done";
};

function TaskCard({ task, columnType }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        task,
        fromColumn: columnType,
      },
    });

  const cardStyles = {
    todo: "bg-blue-200 hover:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400",
    "in-progress":
      "bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-400",
    "for-review":
      "bg-purple-200 hover:bg-purple-300 dark:bg-purple-500 dark:hover:bg-purple-400",
    done: "bg-green-200 hover:bg-green-300 dark:bg-green-500 dark:hover:bg-green-400",
  };

  const style = transform
    ? { transform: `translate3d(transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg p-3 mb-2 shadow-sm transition-colors duration-200 cursor-grab active:cursor-grabbing",
        cardStyles[columnType],
        isDragging && "opacity-50"
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
