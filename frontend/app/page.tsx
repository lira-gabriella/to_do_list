"use client";

import React, { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  is_completed: number;
  created_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const API_URL = "http://localhost:8000/api/todos";

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("failed to fetch");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Network link to backend is broken:", error);
    }
  };

  const handleToggleComplete = async (id: number, currentStatus: number) => {
    try {
      const nextStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: nextStatus }),
      });
      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  
  const handleSaveTextUpdate = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (response.ok) {
        setEditingId(null);
        fetchTodos();
      }
    } catch (error) {
      console.error("Failed to update text:", error);
    }
  };

  const startEditing = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchTodos();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (response.ok) {
        setNewTaskTitle("");
        fetchTodos();
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error("Failed to delete the task:", error);
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-900 text-white"></div>;
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-stone-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600 tracking-tight">My Todo List</h1>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input 
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle} 
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-stone-50 text-stone-900 placeholder-stone-400 border border-stone-200 focus:outline-none focus:border-orange-500"
          />
          <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors">
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input 
                  type="checkbox"
                  checked={todo.is_completed === 1}
                  onClick={() => handleToggleComplete(todo.id, todo.is_completed)}
                  onChange={() => {}} 
                  className="h-5 w-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 bg-white cursor-pointer relative z-10" 
                />
                
                <div className="flex flex-col flex-1 min-w-0">
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="px-2 py-1 rounded bg-white text-stone-900 border border-orange-500 text-base focus:outline-none w-full"
                    />
                  ) : (
                    <span className={`text-lg truncate ${todo.is_completed === 1 ? "line-through text-stone-400" : "text-stone-800"}`}>
                      {todo.title}
                    </span>
                  )}
                  <span className="text-xs text-stone-400 font-mono mt-0.5">
                    {todo.created_at}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-2">
                {editingId === todo.id ? (
                  <>
                    <button 
                      onClick={() => handleSaveTextUpdate(todo.id)}
                      className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-md transition-colors text-xs shadow-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-md transition-colors text-xs shadow-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => startEditing(todo.id, todo.title)}
                      className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md transition-colors text-xs shadow-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(todo.id)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-md border border-stone-200 transition-colors text-xs shadow-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul> 

        {todos.length === 0 && (
          <p className="text-center text-stone-400 mt-4 italic">
            No tasks found! Enjoy your free time.
          </p>
        )}
      </div> 
    </main>  
  );
}
