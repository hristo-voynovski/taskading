import Board from "@/features/board/Board";

function BoardPage() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <Board />
    </div>
  );
}

export default BoardPage;
// This component is the main page of the application. It imports the Board component and renders it inside a flex container. The flex container is set to fill the entire height and width of the screen, and it has overflow hidden to prevent scrolling. The Board component is responsible for rendering the Kanban board and its functionality.