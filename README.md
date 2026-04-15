# Offline-First Todo App

Offline-first desktop todo application built with Tauri, React, TypeScript, SQLite, and Supabase.

## Overview

- UI reads from local SQLite only
- All writes go to local SQLite first
- Every write creates a sync event in `sync_queue`
- Sync service pushes pending events to Supabase when online

## Stack

- Tauri 2
- React 19
- TypeScript
- SQLite via `tauri-plugin-sql`
- Supabase PostgreSQL

## Key Tables

- `todos` - local todo data and cloud mirror
- `sync_queue` - pending local sync events

## Features

- Create todo
- List todos
- Toggle completion
- Delete todo
- Show sync status
- Show pending sync count

## Setup

```bash
npm install
npm run tauri dev
```

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Architecture

`components -> services -> repositories -> db`

Local SQLite is the source of truth for the UI. Supabase is a cloud mirror used for sync.