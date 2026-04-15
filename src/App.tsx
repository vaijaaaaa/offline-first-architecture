import { FormEvent, useEffect, useState } from "react";
import "./App.css";
import type { Todo } from "./types";
import { todoService } from "./services/todoService";
import { getPendingSyncEvents } from "./repositories/syncQueueRepository";
import { supabase } from "./lib/supabaseClient";
import { syncService } from "./services/syncService";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTodos() {
    setLoading(true);
    try {
      const items = await todoService.list();
      setTodos(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    await todoService.create(trimmed);
    setTitle("");
    await loadTodos();
  }

  async function onToggle(todo: Todo) {
    await todoService.toggleComplete(todo.id, !todo.completed);
    await loadTodos();
  }

  async function onDelete(todo: Todo) {
    await todoService.remove(todo.id);
    await loadTodos();
  }

  async function debugPendingSync(){
    const events = await getPendingSyncEvents();
    console.log("Pending sync events :",events);
    
  }
  async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Supabase error:", error);
    } else {
      console.log("Supabase connection successful. Todos found:", data?.length);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
}
async function handleManualSync() {
  try {
    const result = await syncService.syncPendingEvents();
    console.log("Sync result:", result);
    await loadTodos(); // Refresh to update pending count
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
  return (
    <main className="container">
      <h1>Offline Todo</h1>

      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a todo..."
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : todos.length === 0 ? (
        <p>No todos yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo)}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.title}
              </span>
              <button onClick={() => onDelete(todo)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={debugPendingSync}>Show Pending Sync Events</button>
      <button type="button" onClick={testSupabaseConnection}>
  Test Supabase
</button>
<button type="button" onClick={handleManualSync}>
  Manual Sync to Supabase
</button>
    </main>
    
  );
}

export default App;