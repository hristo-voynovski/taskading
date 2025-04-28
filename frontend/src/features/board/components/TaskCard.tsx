import { TaskCardType } from "../types";

type TaskCardProps = {
  task: TaskCardType;
};

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded shadow p-4 mb-2">
      <h3 className="font-semibold text-lg">{task.title}</h3>
      <p className="text-gray-600">{task.content}</p>
      <span className="text-xs text-gray-400">Status: {task.status}</span>
    </div>
  );
}

export default TaskCard;
