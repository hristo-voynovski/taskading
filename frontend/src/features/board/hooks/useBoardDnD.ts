import { useState, useRef } from "react";
import {
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskCardType, ColumnType } from "../types";
import { updateTasks } from "../queries/updateTasks";

export function useBoardDnD(columns: ColumnType[], setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>) {
    const draggedFromColumnId = useRef<string | null>(null);
    const [activeTask, setActiveTask] = useState<TaskCardType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const id = active.id as string;
        const draggedTask = columns
            .map((col) => col.tasks)
            .flat()
            .find((task) => task.id === id);
        if (draggedTask) {
            draggedFromColumnId.current = draggedTask.columnId;
            setActiveTask(draggedTask);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        const allTasks = columns.map((col) => col.tasks).flat();
        const activeTask = allTasks.find((task) => task.id === activeId);
        const overTask = allTasks.find((task) => task.id === overId);
        if (!activeTask) return;
        const overColumn = columns.find((col) => col.columnId === overId);
        if (!!overColumn && activeTask.columnId !== overColumn.columnId) {
            setColumns((prevColumns) => {
                const sourceColumnIndex = prevColumns.findIndex((col) => col.columnId === activeTask.columnId);
                const destColumnIndex = prevColumns.findIndex((col) => col.columnId === overColumn.columnId);
                if (sourceColumnIndex === -1 || destColumnIndex === -1) return prevColumns;
                const newColumns = [...prevColumns];
                const updatedSourceTasks = newColumns[sourceColumnIndex].tasks.filter((task) => task.id !== activeTask.id);
                const updatedTask = { ...activeTask, columnId: overColumn.columnId, status: overColumn.type };
                const updatedDestTasks = [...newColumns[destColumnIndex].tasks, updatedTask];
                newColumns[sourceColumnIndex] = { ...newColumns[sourceColumnIndex], tasks: updatedSourceTasks };
                newColumns[destColumnIndex] = { ...newColumns[destColumnIndex], tasks: updatedDestTasks };
                return newColumns;
            });
            return;
        }
        if (!overTask) return;
        if (activeTask.columnId !== overTask.columnId) {
            setColumns((prevColumns) => {
                const sourceColumnIndex = prevColumns.findIndex((col) => col.columnId === activeTask.columnId);
                const destColumnIndex = prevColumns.findIndex((col) => col.columnId === overTask.columnId);
                if (sourceColumnIndex === -1 || destColumnIndex === -1) return prevColumns;
                const newColumns = [...prevColumns];
                const updatedSourceTasks = newColumns[sourceColumnIndex].tasks.filter((task) => task.id !== activeTask.id);
                const updatedTask = { ...activeTask, columnId: overTask.columnId, status: overTask.status };
                const overTaskIndex = newColumns[destColumnIndex].tasks.findIndex((task) => task.id === overTask.id);
                const updatedDestTasks = [...newColumns[destColumnIndex].tasks];
                updatedDestTasks.splice(overTaskIndex + 1, 0, updatedTask);
                newColumns[sourceColumnIndex] = { ...newColumns[sourceColumnIndex], tasks: updatedSourceTasks };
                newColumns[destColumnIndex] = { ...newColumns[destColumnIndex], tasks: updatedDestTasks };
                return newColumns;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) {
            return;
        }
        const activeId = active.id as string;
        const overId = over.id as string;
        const isDroppingIntoColumn = columns.some((col) => col.columnId === overId);
        if (isDroppingIntoColumn) {
            const activeTask = columns.flatMap((col) => col.tasks).find((t) => t.id === activeId);
            const overColumn = columns.find((col) => col.columnId === overId);
            const sourceColumn = columns.find((col) => col.columnId === draggedFromColumnId.current);
            if (!activeTask || !overColumn || !sourceColumn) {
                draggedFromColumnId.current = null;
                return;
            }
            const updatedSourceTasks = sourceColumn.tasks.filter((t) => t.id !== activeTask.id).map((t, i) => ({ ...t, position: i + 1 }));
            const newColumns = columns.map((col) => {
                if (col.columnId === sourceColumn.columnId) {
                    return { ...col, tasks: updatedSourceTasks };
                }
                if (col.columnId === overColumn.columnId) {
                    return { ...col, tasks: overColumn.tasks };
                }
                return col;
            });
            const updatedTasks = newColumns.flatMap((col) => col.tasks);
            setColumns(newColumns);
            updateTasks(updatedTasks);
            draggedFromColumnId.current = null;
            return;
        }
        const allTasks = columns.map((col) => col.tasks).flat();
        const activeTask = allTasks.find((task) => task.id === activeId);
        const overTask = allTasks.find((task) => task.id === overId);
        if (!activeTask) {
            return;
        }
        const overColumn = columns.find((col) => col.columnId === overId);
        if (overColumn && activeTask.columnId !== overColumn.columnId) {
            setColumns((prevColumns) => {
                const sourceIndex = prevColumns.findIndex((c) => c.columnId === activeTask.columnId);
                const destIndex = prevColumns.findIndex((c) => c.columnId === overColumn.columnId);
                if (sourceIndex === -1 || destIndex === -1) return prevColumns;
                const sourceCol = prevColumns[sourceIndex];
                const destCol = prevColumns[destIndex];
                const movedTask = { ...activeTask, columnId: overColumn.columnId, status: overColumn.type };
                const updatedSource = sourceCol.tasks.filter((t) => t.id !== activeId).map((t, i) => ({ ...t, position: i + 1 }));
                const updatedDest = [...destCol.tasks, movedTask].map((t, i) => ({ ...t, position: i + 1 }));
                const newColumns = [...prevColumns];
                newColumns[sourceIndex] = { ...sourceCol, tasks: updatedSource };
                newColumns[destIndex] = { ...destCol, tasks: updatedDest };
                const updatedTasks = newColumns.flatMap((col) => col.tasks);
                updateTasks(updatedTasks);
                return newColumns;
            });
            return;
        }
        if (!overTask) {
            return;
        }
        if (activeTask.columnId === overTask.columnId) {
            setColumns((prevColumns) => {
                const columnIndex = prevColumns.findIndex((col) => col.columnId === activeTask.columnId);
                if (columnIndex === -1) return prevColumns;
                const column = prevColumns[columnIndex];
                const activeIndex = column.tasks.findIndex((task) => task.id === activeId);
                const overIndex = column.tasks.findIndex((task) => task.id === overId);
                const reorderedTasks = arrayMove(column.tasks, activeIndex, overIndex).map((t, i) => ({ ...t, position: i + 1 }));
                const newColumns = [...prevColumns];
                newColumns[columnIndex] = { ...column, tasks: reorderedTasks };
                const updatedTasks = newColumns.flatMap((col) => col.tasks);
                updateTasks(updatedTasks);
                return newColumns;
            });
        } else {
            setColumns((prevColumns) => {
                const sourceIndex = prevColumns.findIndex((c) => c.columnId === activeTask.columnId);
                const destIndex = prevColumns.findIndex((c) => c.columnId === overTask.columnId);
                if (sourceIndex === -1 || destIndex === -1) return prevColumns;
                const sourceCol = prevColumns[sourceIndex];
                const destCol = prevColumns[destIndex];
                const movedTask = { ...activeTask, columnId: overTask.columnId, status: overTask.status };
                const updatedSource = sourceCol.tasks.filter((t) => t.id !== activeId).map((t, i) => ({ ...t, position: i + 1 }));
                const overIndex = destCol.tasks.findIndex((t) => t.id === overId);
                const updatedDest = [...destCol.tasks];
                updatedDest.splice(overIndex + 1, 0, movedTask);
                const normalizedDest = updatedDest.map((t, i) => ({ ...t, position: i + 1 }));
                const newColumns = [...prevColumns];
                newColumns[sourceIndex] = { ...sourceCol, tasks: updatedSource };
                newColumns[destIndex] = { ...destCol, tasks: normalizedDest };
                const updatedTasks = newColumns.flatMap((col) => col.tasks);
                updateTasks(updatedTasks);
                return newColumns;
            });
        }
    };

    return {
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        activeTask,
        setActiveTask,
    };
}
