
"use client";
import { useState, useRef, useEffect } from "react";
// ...existing code...
import { TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import confetti from "canvas-confetti";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: number;
};

function gradientBg() {
  return "bg-gradient-to-br from-blue-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900";
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [finished, setFinished] = useState<Task[]>([]);
  // Load tasks from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("tasks");
    const f = localStorage.getItem("finished");
    if (t) setTasks(JSON.parse(t));
    if (f) setFinished(JSON.parse(f));
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("finished", JSON.stringify(finished));
  }, [finished]);
  const [tab, setTab] = useState<"incomplete" | "finished">("incomplete");
  const [input, setInput] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Math.random().toString(36).slice(2),
        title: input,
        description: desc,
        dueDate: due,
        completed: false,
        createdAt: Date.now(),
      },
    ]);
    setInput("");
    setDesc("");
    setDue("");
    inputRef.current?.focus();
  };

  const deleteTask = (id: string) => {
    const t = tasks.find((t) => t.id === id);
    if (t) setFinished([t, ...finished]);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: true }
          : t
      )
    );
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { y: 0.7 },
    });
    // Move to finished after a short delay for animation
    setTimeout(() => {
      const t = tasks.find((t) => t.id === id);
      if (t) {
        setFinished((f) => [{ ...t, completed: true }, ...f]);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    }, 600);
  };

  const editTask = (id: string, field: keyof Task, value: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="min-h-screen p-0 sm:p-8 flex flex-col items-center bg-[#fffde7] transition-all">
      <div className="w-full max-w-2xl mt-10 mb-6 rounded-2xl bg-white border border-yellow-100 p-6 sm:p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-center" style={{ color: '#a67c00' }}>To-Do List</h1>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            className="flex-1 rounded-lg border border-yellow-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-[#fffbe6] text-yellow-900 placeholder:text-yellow-400"
            placeholder="Task title..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          {input.trim() && (
            <textarea
              className="flex-1 rounded-lg border border-yellow-200 px-3 py-3 min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-[#fffbe6] text-yellow-900 placeholder:text-yellow-400"
              placeholder="Description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          )}
          <div className="flex flex-row gap-3 items-center mt-1">
            <input
              type="date"
              className="rounded-lg border border-yellow-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-[#fffbe6] text-yellow-900"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button
              className="rounded-lg bg-[#a67c00] text-white px-4 py-2 font-semibold transition-colors hover:bg-yellow-700 flex items-center gap-2"
              onClick={addTask}
            >
              <PlusIcon className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button
              className={`px-4 py-1 rounded-full font-medium transition-all ${tab === "incomplete" ? "bg-blue-200 text-blue-900" : "bg-gray-100 text-gray-500"}`}
              onClick={() => setTab("incomplete")}
            >
              Incomplete ({tasks.length})
            </button>
            <button
              className={`px-4 py-1 rounded-full font-medium transition-all ${tab === "finished" ? "bg-pink-200 text-pink-900" : "bg-gray-100 text-gray-500"}`}
              onClick={() => setTab("finished")}
            >
              Finished ({finished.length})
            </button>
          </div>
          <span className="text-sm text-gray-400">Total added: {tasks.length + finished.length}</span>
        </div>
        <div className="mt-4">
          {tab === "incomplete" ? (
            <ul className="flex flex-col gap-4">
              {tasks.length === 0 && (
                <li className="text-center text-gray-400">No incomplete tasks.</li>
              )}
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 transition-all ${task.completed ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => !task.completed && completeTask(task.id)}
                      className="accent-pink-500 w-5 h-5 rounded shadow-sm cursor-pointer"
                    />
                    <input
                      className="font-semibold text-lg bg-transparent border-none outline-none w-full focus:ring-0 focus:outline-none"
                      value={task.title}
                      onChange={(e) => editTask(task.id, "title", e.target.value)}
                      disabled={task.completed}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
                    <input
                      className="text-sm bg-transparent border-b border-gray-200 dark:border-gray-600 outline-none focus:border-pink-400 transition-colors w-40"
                      value={task.description}
                      onChange={(e) => editTask(task.id, "description", e.target.value)}
                      placeholder="Description"
                      disabled={task.completed}
                    />
                    <input
                      type="date"
                      className="text-sm bg-transparent border-b border-gray-200 dark:border-gray-600 outline-none focus:border-blue-400 transition-colors w-32"
                      value={task.dueDate}
                      onChange={(e) => editTask(task.id, "dueDate", e.target.value)}
                      disabled={task.completed}
                    />
                    <button
                      className="ml-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-4">
              {finished.length === 0 && (
                <li className="text-center text-gray-400">No finished tasks.</li>
              )}
              {finished.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-xl bg-gradient-to-r from-pink-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 opacity-70"
                >
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="accent-pink-500 w-5 h-5 rounded shadow-sm"
                    />
                    <span className="font-semibold text-lg line-through">{task.title}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
                    <span className="text-sm text-gray-500">{task.description}</span>
                    <span className="text-sm text-gray-400">{task.dueDate}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1" />
  <footer className="text-center text-xs text-gray-400 mt-10 mb-4">Made with Next.js & Tailwind CSS</footer>
    </div>
  );
}
