# AGENTS.md

## Commands

```bash
npm run dev          # Vite dev server (localhost:1420)
npm run build       # TypeScript check + Vite build
npm run tauri dev   # Run Tauri desktop app in dev mode
npm run tauri build # Build production desktop app
```

## Env Setup

Create `.env` in root:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Architecture

- **Frontend**: React 19 + TypeScript + Vite (port 1420)
- **Backend**: Tauri 2 (Rust)
- **Local DB**: SQLite via `tauri-plugin-sql` (`offline_todo.db`)
- **Cloud**: Supabase PostgreSQL for sync

```
src/
  App.tsx           # Main UI
  db/client.ts     # SQLite connection singleton
  repositories/   # todoRepository, syncQueueRepository
  services/       # todoService (CRUD), syncService (cloud sync)
src-tauri/src/db.rs  # Database migrations (tables, indexes)
```

## Key Patterns

- **Offline-first**: All writes → local SQLite first → sync_queue → Supabase
- **Soft delete**: `deleteTodo` sets `deleted_at` timestamp, not hard delete
- **Sync ordering**: Operations sync in create → update → delete order
- **Idempotent creates**: Uses `upsert` with `onConflict: "id"`

## Database

Tables defined in `src-tauri/src/db.rs`:
- `todos` - id, title, description, completed, created_at, updated_at, deleted_at, synced
- `sync_queue` - entity_type, entity_id, operation, payload, status, retry_count, last_error