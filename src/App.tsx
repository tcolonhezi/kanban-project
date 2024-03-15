import { MdEdit } from "react-icons/md";
import "./App.css";
import KanbanBoard from "./components/KanbanBoard";
import { useEffect, useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState(() => {
    const storedTitle = localStorage.getItem("title");
    if (storedTitle) {
      return JSON.parse(storedTitle);
    }
    return "Kanban Board";
  } );
  
  const [isEditMode, setEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("title", JSON.stringify(title));
  })

  return (
    <div className="my-12 mx-12 ">
      <div className="flex items-center gap-4">
        {isEditMode ? (
          <input
            className="text-3xl font-bold bg-transparent outline-none"
            onBlur={() => setEditMode(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditMode(false);
              }
            }}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h1 className="text-3xl font-bold">{title}</h1>
        )}

        <button onClick={() => setEditMode(true)}>
          <MdEdit className="size-6" />
        </button>
      </div>
      <div>
        <form className="flex gap-4 mt-8" action="">
          <input
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg px-8 py-3 border-[0.7px] border-gray-400"
            type="text"
            placeholder="Search a task using the title or description"
          />
        </form>
      </div>

      <KanbanBoard filter={search} />
    </div>
  );
}

export default App;
