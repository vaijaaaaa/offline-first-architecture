import Database from "@tauri-apps/plugin-sql";
import "./App.css";

function App() {
  async function testDb() {
    const db = await Database.load("sqlite:offline_todo.db");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute(
      "INSERT INTO todos (id, title, completed, created_at, updated_at, synced) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
      [id, "First local todo", 0, now, now, 0]
    );

    const rows = await db.select(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE deleted_at IS NULL"
    );

    console.log("todos:", rows);
  }

  return (
    <main className="container">
      <h1>SQLite Test</h1>
      <button onClick={testDb}>Test SQLite</button>
    </main>
  );
}

export default App;