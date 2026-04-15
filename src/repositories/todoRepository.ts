import { getDb} from "../db/client";
import type { Todo } from "../types";

type TodoRow = {
    id : string;
    title : string;
    description : string | null;
    completed : number;
    created_at : string;
    updated_at : string;
    deleted_at : string | null;
};


export async function createTodo (
    title : string,
    description? : string
) : Promise<Todo>{
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.execute(
        `INSERT INTO todos (id, title, description, completed, created_at, updated_at, deleted_at, synced)
     VALUES (?1, ?2, ?3, 0, ?4, ?5, NULL, 0)`,
    [id, title, description ?? null, now, now]
    )
    return {
        id,
        title,
        description : description ?? undefined,
        completed:false,
        createdAt:now,
        updatedAt:now,
        deletedAt:null,

    };
}

export async function getTodos(): Promise<Todo[]> {
  const db = await getDb();

  const rows = await db.select<TodoRow[]>(
    `SELECT id, title, description, completed, created_at, updated_at, deleted_at
     FROM todos
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }));
}

export async function updateTodo(
  id: string,
  updates: { title?: string; description?: string; completed?: boolean }
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  if (typeof updates.title !== "undefined") {
    await db.execute(
      `UPDATE todos
       SET title = ?1, updated_at = ?2, synced = 0
       WHERE id = ?3`,
      [updates.title, now, id]
    );
  }

  if (typeof updates.description !== "undefined") {
    await db.execute(
      `UPDATE todos
       SET description = ?1, updated_at = ?2, synced = 0
       WHERE id = ?3`,
      [updates.description, now, id]
    );
  }

  if (typeof updates.completed !== "undefined") {
    await db.execute(
      `UPDATE todos
       SET completed = ?1, updated_at = ?2, synced = 0
       WHERE id = ?3`,
      [updates.completed ? 1 : 0, now, id]
    );
  }
}

export async function toggleTodoCompleted(
  id: string,
  completed: boolean
): Promise<void> {
  await updateTodo(id, { completed });
}

export async function softDeleteTodo(id: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE todos
     SET deleted_at = ?1, updated_at = ?2, synced = 0
     WHERE id = ?3`,
    [now, now, id]
  );
}