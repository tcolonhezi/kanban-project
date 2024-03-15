import { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "../assets/PlusIcon";
import { Column, Id, Task } from "../types/types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskCard } from "./TaskCard";

type KanbanBoardProps = {
  filter: string;
};

function KanbanBoard({ filter }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(() => {
    const storedColumns = localStorage.getItem("columns");
    if (storedColumns) {
      return JSON.parse(storedColumns);
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
    return [];
  });

  const columnsId = useMemo(() => {
    return columns.map((columns) => columns.id);
  }, [columns]);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  useEffect(() => {
    saveColumns();
  }, [columns]);

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function saveColumns() {
    localStorage.setItem("columns", JSON.stringify(columns));
  }

  const [isActiveColumn, setIsActiveColumn] = useState<Column | null>(null);
  const [isActiveTask, setIsActiveTask] = useState<Task | null>(null);

  const searchTasks =
    filter != ""
      ? tasks.filter(
          (task) =>
            task.description.toLowerCase().includes(filter.toLowerCase()) ||
            task.title.toLowerCase().includes(filter)
        )
      : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  return (
    <div className="flex mt-8 overflow-x-auto ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  deleteColumn={deleteColumn}
                  column={column}
                  handleColumnTitleChanged={handleColumnTitleChanged}
                  handleTaskAdded={handleTaskAdded}
                  tasks={searchTasks.filter(
                    (filteredTasks) => filteredTasks.ColumnId === column.id
                  )}
                  handleTaskDeleted={handleTaskDeleted}
                  handleTaskTitleEdited={handleTaskTitleEdited}
                  handleTaskDescriptionEdited={handleTaskDescriptionEdited}
                />
              ))}
            </SortableContext>
          </div>
          <div>
            <button
              onClick={createNewColumn}
              className="bg-violet-600 w-[200px] h-[55px] opacity-80 text-white flex gap-2 rounded-md px-8 py-3 cursor-pointer  border-2 p-4 hover:opacity-100 "
            >
              <PlusIcon />
              Add Column
            </button>
          </div>
        </div>
        {createPortal(
          <DragOverlay>
            {isActiveColumn && (
              <ColumnContainer
                column={isActiveColumn}
                deleteColumn={deleteColumn}
                handleColumnTitleChanged={handleColumnTitleChanged}
                handleTaskAdded={handleTaskAdded}
                tasks={tasks.filter(
                  (task) => task.ColumnId === isActiveColumn.id
                )}
                handleTaskDeleted={handleTaskDeleted}
                handleTaskTitleEdited={handleTaskTitleEdited}
                handleTaskDescriptionEdited={handleTaskDescriptionEdited}
              />
            )}
            {isActiveTask && (
              <TaskCard
                task={isActiveTask}
                handleTaskDeleted={handleTaskDeleted}
                handleTaskTitleEdited={handleTaskTitleEdited}
                handleTaskDescriptionEdited={handleTaskDescriptionEdited}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function handleTaskAdded(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      ColumnId: columnId,
      title: `Task ${tasks.length + 1}`,
      description: "Description of the task",
    };
    setTasks([...tasks, newTask]);
  }

  function handleTaskDeleted(id: Id) {
    const filteredTasks = tasks.filter((task) => task.id !== id);
    setTasks(filteredTasks);
  }

  function handleTaskTitleEdited(id: Id, title: string) {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, title } : task
    );
    setTasks(newTasks);
  }

  function handleTaskDescriptionEdited(id: Id, description: string) {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, description } : task
    );
    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function handleColumnTitleChanged(id: Id, title: string) {
    const newColumns = columns.map((column) =>
      column.id === id ? { ...column, title } : column
    );
    setColumns(newColumns);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((column) => column.id !== id);

    const filteredTasks = tasks.filter((task) => task.ColumnId !== id);

    setTasks(filteredTasks);
    setColumns(filteredColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setIsActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setIsActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setIsActiveColumn(null);
    setIsActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeColumId = active.id;
    const overColumId = over.id;

    if (activeColumId === overColumId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeColumId = active.id;
    const overColumId = over.id;

    if (activeColumId === overColumId) return;

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;

    //im dropping a task over another task
    const isOverATask = over.data.current?.type === "Task";
    if (isActiveTask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === active.id);
        const overIndex = tasks.findIndex((t) => t.id === over.id);

        tasks[activeIndex].ColumnId = tasks[overIndex].ColumnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    //im dropping a task over a column
    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === active.id);
        const overIndex = tasks.findIndex((t) => t.id === over.id);

        tasks[activeIndex].ColumnId = overColumId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
  }
}

function generateId() {
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
