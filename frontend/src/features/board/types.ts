export interface TaskCardType  {
  id: string;
  columnId: string;
  order: number;
  title: string;
  content: string;
  status: "todo" | "in-progress" | "for-review" | "done";
};

export interface ColumnType  {
  type: "todo" | "in-progress" | "done";
  title: string;
  tasks: TaskCardType[];
}
