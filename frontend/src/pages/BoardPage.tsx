import Board from "@/features/board/Board";
import ThemeToggle from "@/components/ThemeToggle";

const boardId = "cb19236b-c160-4c7f-9fff-a9a81bf694ac";
function BoardPage() {
 
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <ThemeToggle />
      <Board />
    </div>
  );
}

export default BoardPage;
