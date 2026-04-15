#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use tauri_plugin_sql::Builder as SqlBuilder;

#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

fn main() {
    tauri::Builder::default()
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:offline_todo.db", db::get_migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}