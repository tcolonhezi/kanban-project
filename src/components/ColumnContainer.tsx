import { MdOutlineDelete } from "react-icons/md";
import { Column, Id, Task } from "../types/types";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { TaskCard } from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  handleColumnTitleChanged: (id: Id, title: string) => void;
  handleTaskAdded: (columnId: Id) => void;

  tasks: Task[];
  handleTaskDeleted: (id: Id) => void;
  handleTaskTitleEdited: (id: Id, title: string) => void;
  handleTaskDescriptionEdited: (id: Id, description: string) => void;
}

function ColumnContainer({
  column,
  deleteColumn,
  handleColumnTitleChanged,
  handleTaskAdded,
  tasks,
  handleTaskDeleted,
  handleTaskTitleEdited,
  handleTaskDescriptionEdited,
}: Props) {
  const [isEditMode, setIsEditMode] = useState(false);
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const [isMouseHoverColumn, setIsMouseHoverColumn] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: isEditMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-violet-400 opacity-30 text-white w-[350px] h-min-[50vh] max-h-[90vh] rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className=" w-[350px] h-min-[50vh] rounded-md flex flex-col mb-8"
    >
      {/* Column header */}
      <div
        onMouseEnter={() => setIsMouseHoverColumn(true)}
        onMouseLeave={() => setIsMouseHoverColumn(false)}
        {...attributes}
        {...listeners}
        className=" p-3 text-md h-[60px] cursor-grab rounded-md rounded-b-none flex items-center"
      >
        <div className="flex items-center w-full">
          {!isEditMode ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <h3
                  onClick={() => setIsEditMode(true)}
                  className="text-xl font-bold text-[#403937]"
                >
                  {column.title} - {tasks.length}
                </h3>
              </div>
              {isMouseHoverColumn && (
                <button
                  className="flex gap-4 items-center right-4 bottom-4 rounded-full p-2 bg-slate-500 opacity-50 hover:opacity-100"
                  onClick={() => deleteColumn(column.id)}
                >
                  <MdOutlineDelete className="size-6" />
                </button>
              )}
            </div>
          ) : (
            <input
              type="text"
              className=" rounded-md p-2 w-full"
              value={column.title}
              onChange={(e) =>
                handleColumnTitleChanged(column.id, e.target.value)
              }
              autoFocus
              onBlur={() => setIsEditMode(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditMode(false)}
            />
          )}
        </div>
      </div>
      {/* Column task container */}
      <div className="flex flex-col gap-4 p-2 overflow-y-auto overflow-x-hidden relative">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              handleTaskDeleted={handleTaskDeleted}
              handleTaskTitleEdited={handleTaskTitleEdited}
              handleTaskDescriptionEdited={handleTaskDescriptionEdited}
            />
          ))}
        </SortableContext>
        <div className="justify-end">
          <button
            onClick={() => handleTaskAdded(column.id)}
            className="flex gap-2 rounded-md mt-4 px-5 py-3 items-center bg-violet-600 opacity-80 text-white shadow-lg hover:opacity-100"
          >
            <IoIosAddCircleOutline className="size-6" />
            Add Task
          </button>
        </div>
      </div>
      {/* Column footer  */}
    </div>
  );
}

export default ColumnContainer;
