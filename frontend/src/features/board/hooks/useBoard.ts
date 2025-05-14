import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../queries/fetchTasks";
import { useTasksRealtime } from "./useTasksRealtime";
import { TaskCardType } from "../types";

export const useBoard = (boardId: string) => {
  // console.log("In useBoard", boardId);
  const query = useQuery<TaskCardType[]>({
    queryKey: ["tasks", boardId],
    queryFn: () => fetchTasks(boardId),
    // refetchOnWindowFocus: false,
    // refetchOnReconnect: false,
    // refetchInterval: 10000
  })
  // console.log("Query data:", query.data);
  useTasksRealtime(boardId);

  return query;
};
