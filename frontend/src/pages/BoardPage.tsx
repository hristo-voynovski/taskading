import Board from "@/features/board/Board";
import ThemeToggle from "@/components/ThemeToggle";

function BoardPage() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <ThemeToggle />
      <Board />
    </div>
  );
}

export default BoardPage;