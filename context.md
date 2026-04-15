Phase 1 — Setup project

Goal:

create Tauri app
clean project structure
install dependencies
verify app runs
Phase 2 — Setup local SQLite

Goal:

connect SQLite
create todos table
create sync_queue table
test DB insert/select
Phase 3 — Build todo CRUD locally

Goal:

create todo
list todos
toggle complete
delete todo
everything works offline locally
Phase 4 — Add sync queue

Goal:

every local create/update/delete also inserts a sync event into sync_queue
Phase 5 — Setup Supabase

Goal:

create Supabase project
create todos table in cloud
connect app to Supabase
Phase 6 — Build sync engine

Goal:

read pending sync events
send them to Supabase
mark them as synced
retry on failure
Phase 7 — UI sync status

Goal:

show offline/online
pending sync count
last sync time
Phase 8 — Improve architecture

Goal:

cleaner services
repositories
background sync timer
reconnect sync

That is the correct learning path.