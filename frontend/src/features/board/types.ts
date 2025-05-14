export interface TaskCardType  {
  id: string;
  columnId: string;
  position: number;
  title: string;
  content: string;
  status: "todo" | "in-progress" | "for-review" | "done";
};

export interface ColumnType  {
  title: string;
  type: "todo" | "in-progress" | "for-review" | "done";
  columnId: string;
  tasks: TaskCardType[];
}
