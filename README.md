# Offline-First-Architecture

Offline-first desktop todo application built with Tauri, React, TypeScript, SQLite, and Supabase.
## Architecture
<img width="1220" height="4672" alt="offline-firsr-arc" src="https://github.com/user-attachments/assets/5d630bfe-e475-4dc3-9e25-e183c0ab7c3d" />

## Video Reference
<p align="center">
  <a href="https://youtu.be/Sd_eMVEKVfE?si=82UQTTRe1PaAKh7s" target="_blank">
    <img src="https://img.youtube.com/vi/Sd_eMVEKVfE/maxresdefault.jpg" alt="Watch the architecture video" width="700" />
  </a>
</p>

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





Local SQLite is the source of truth for the UI. Supabase is a cloud mirror used for sync.
