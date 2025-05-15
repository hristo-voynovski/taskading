import { useQuery } from "@tanstack/react-query";
import { fetchColumns } from "../queries/fetchColumns";
import { ColumnType } from "../types";

export const useColumns = (boardId: string) => {
  const columnQuery = useQuery<Omit<ColumnType, "title" | "tasks">[]>({
    queryKey: ["columns", boardId],
    queryFn: () => fetchColumns(boardId),
  });
  return columnQuery;
};
