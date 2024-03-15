import { useEffect, useRef, useState } from "react";
import { Id, Task } from "../types/types";
import { CSS } from "@dnd-kit/utilities";
import { MdOutlineDelete } from "react-icons/md";
import { useSortable } from "@dnd-kit/sortable";

type TaskCardProps = {
  task: Task;
  handleTaskDeleted: (id: Id) => void;
  handleTaskTitleEdited: (id: Id, title: string) => void;
  handleTaskDescriptionEdited: (id: Id, description: string) => void;
};

export function TaskCard({
  task,
  handleTaskDeleted,
  handleTaskTitleEdited,
  handleTaskDescriptionEdited,
}: TaskCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMouseHoverTask, setIsMouseHoverTask] = useState(false);
  const newRef = useRef<HTMLDivElement | null>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isEditMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  });

  const setRefs = (node: HTMLDivElement) => {

    setNodeRef(node);

    if (node) {
      newRef.current = node;
    }
  };

  const handleOutsideClick = (e: { target: any }) => {
    if (newRef.current && !newRef.current.contains(e.target)) {
      setIsEditMode(false);
    }
  };

  if (isDragging) {
    return (
      <div
        style={style}
        ref={setNodeRef}
        className="opacity-30 bg-violet-400 p-4 h-[100px] overflow-y-auto overflow-x-hidden flex flex-col text-left rounded-xl gap-2 hover:bg-slate-800 hover:ring-2 cursor-grab relative"
      >
        {task.title}
      </div>
    );
  }

  const handleClickInside = () => {
    setIsEditMode(true);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setIsMouseHoverTask(false);
  };

  if (isEditMode) {
    return (
      <div
        onClick={handleClickInside}
        style={style}
        ref={setRefs}
        {...attributes}
        {...listeners}
        className="bg-white p-6 overflow-y-auto overflow-x-hidden flex flex-col\
        shadow-lg text-left rounded-xl gap-4 hover:bg-slate-100 hover:ring-2 hover:ring-violet-600 cursor-grab relative"
      >
        <div className="flex flex-col gap-2 w-full ">
          <input
            className="text-sm font-bold bg-transparent p-1 focus:outline-none"
            type="text"
            placeholder="Task Title"
            value={task.title}
            onChange={(e) => handleTaskTitleEdited(task.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleEditMode();
              }
            }}
          />
          <textarea
            className="text-sm text-[#756966] bg-transparent resize-none p-1 w-full h-[100px] outline-none"
            placeholder="Task Description"
            value={task.description}
            onChange={(e) =>
              handleTaskDescriptionEdited(task.id, e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                toggleEditMode();
              }
            }}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={style}
        ref={setRefs}
        {...attributes}
        {...listeners}
        onClick={() => setIsEditMode(!isEditMode)}
        onMouseEnter={() => setIsMouseHoverTask(true)}
        onMouseLeave={() => setIsMouseHoverTask(false)}
        className="bg-white p-6 overflow-x-hidden flex flex-col\
        shadow-lg text-left rounded-xl gap-4 hover:bg-slate-100 hover:ring-2 hover:ring-violet-600 cursor-grab relative"
      >
        <div className="flex flex-col gap-2 w-full">
          <div key={task.id} className="">
            <h5 className="font-bold text-sm">{task.title}</h5>
          </div>

          <p className="overflow-y-auto max-h-[100px] my-auto w-full whitespace-pre-wrap text-sm text-[#756966]">
            {task.description}
          </p>
        </div>

        {isMouseHoverTask ? (
          <button
            onClick={() => handleTaskDeleted(task.id)}
            className="flex gap-4 items-center absolute right-4 bottom-4 rounded-full p-2 bg-slate-500 opacity-50 hover:opacity-100"
          >
            <MdOutlineDelete className="size-5" />
          </button>
        ) : null}
      </div>
    );
  }
}
