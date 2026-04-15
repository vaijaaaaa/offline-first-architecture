import Database from "@tauri-apps/plugin-sql";

let dbInstance : Database | null = null;

export async function getDb(){
    if(dbInstance) return dbInstance;
    dbInstance = await Database.load("sqlite:offline_todo.db");
    return dbInstance;
}