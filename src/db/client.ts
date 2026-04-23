import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
    if (dbPromise) return dbPromise;
    
    dbPromise = Database.load("sqlite:offline_todo.db");
    return dbPromise;
}