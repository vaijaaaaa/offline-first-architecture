use tauri_plugin_sql::{Migration, MigrationBuilder};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        MigrationBuilder::new(0)
            .description("create todos and sync_queue tables")
            .sql(
                r#"
                CREATE TABLE IF NOT EXISTS todos (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    synced INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS sync_queue (
                    id TEXT PRIMARY KEY,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
                    payload TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'synced', 'failed')),
                    created_at TEXT NOT NULL,
                    synced_at TEXT,
                    retry_count INTEGER NOT NULL DEFAULT 0,
                    last_error TEXT
                );

                CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
                CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
                "#,
            )
            .build()
            .unwrap(),
    ]
}