import { ColumnType } from "../types";

type ColumnProps = {
  column: ColumnType;
}

function Column({ column }: ColumnProps) {
  return (
    <div>
      <h2>{column.title}</h2>
      {column.tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Column;
