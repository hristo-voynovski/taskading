import { TaskCardType } from "../types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTask } from "../queries/deleteTask";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

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

  const buttonStyles = {
    todo: "bg-blue-300 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-700",
    "in-progress":
      "bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-700",
    "for-review":
      "bg-purple-300 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-700",
    done: "bg-green-300 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-700",
  };

  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteTask(task.id);
      setOpen(false);
      // Optionally: trigger a UI update here (e.g., refetch tasks or update state)
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg p-3 mb-2 shadow-sm transition-colors duration-200 cursor-grab active:cursor-grabbing",
        cardStyles[columnType]
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <button
          className={cn("ml-2 p-1 rounded-md  transition-colors", buttonStyles[columnType])}
          aria-label="Delete task"
          onClick={() => setOpen(true)}
        >
          <X size={16} />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
