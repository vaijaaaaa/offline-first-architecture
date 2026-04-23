import { FormEvent, useEffect, useState, useCallback } from "react";
import "./App.css";
import type { Todo } from "./types";
import { todoService } from "./services/todoService";
import { syncService } from "./services/syncService";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const items = await todoService.list();
      setTodos(items);
    } catch (err) {
      setError("Failed to load todos");
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncService.syncPendingEvents();
      await loadTodos();
    } catch (err) {
      console.error("Auto-sync failed", err);
    } finally {
      setSyncing(false);
    }
  }, [syncing, loadTodos]);

  useEffect(() => {
    loadTodos();
    // Initial sync on mount
    triggerSync();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await todoService.create(trimmed);
      setTitle("");
      await loadTodos();
      triggerSync(); // Trigger sync after operation
    } catch (err) {
      setError("Failed to create todo");
    }
  }

  async function onToggle(todo: Todo) {
    try {
      await todoService.toggleComplete(todo.id, !todo.completed);
      await loadTodos();
      triggerSync();
    } catch (err) {
      setError("Failed to update todo");
    }
  }

  async function onDelete(todo: Todo) {
    try {
      await todoService.remove(todo.id);
      await loadTodos();
      triggerSync();
    } catch (err) {
      setError("Failed to delete todo");
    }
  }

  return (
    <main className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Offline Todo</h1>
        <div style={{ fontSize: "0.8rem", color: syncing ? "#3498db" : "#27ae60" }}>
          {syncing ? "Syncing..." : "Cloud Synced"}
        </div>
      </header>

      {error && (
        <div style={{ padding: 8, marginBottom: 16, background: "#fee", color: "#c00", borderRadius: 4 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a todo..."
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={!title.trim()}>Add</button>
      </form>

      {todos.length === 0 ? (
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
                padding: "8px",
                background: "#f9f9f9",
                borderRadius: "4px",
                borderLeft: todo.synced ? "4px solid #27ae60" : "4px solid #f1c40f"
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
                  color: todo.completed ? "#888" : "#333"
                }}
              >
                {todo.title}
              </span>
              <button 
                onClick={() => onDelete(todo)}
                style={{ background: "#e74c3c", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #eee" }}>
         <button 
            type="button" 
            onClick={triggerSync} 
            disabled={syncing}
            style={{ fontSize: "0.8rem" }}
          >
            {syncing ? "Syncing..." : "Force Sync Now"}
          </button>
      </div>
    </main>
  );
}

export default App;