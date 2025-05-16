import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCardType } from "../types";

type Props = {
  onSubmit: (task: Omit<TaskCardType, "id" | "position">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: TaskCardType["status"];
};

function AddTask({
  onSubmit,
  open,
  onOpenChange,
  initialStatus = "todo",
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<
    "todo" | "in-progress" | "for-review" | "done"
  >(initialStatus);

  console.log("status", status);

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setStatus(initialStatus);
    }
  }, [open, initialStatus]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, status, columnId: status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a new task to the board.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="Task Title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-status">Task Status</Label>
            <Select
              required
              value={status}
              onValueChange={(value: TaskCardType["status"]) =>
                setStatus(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="for-review">For Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-content">Task Content</Label>
            <Input
              id="task-content"
              placeholder="Task Content"
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddTask;
