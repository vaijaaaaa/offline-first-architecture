import { getDb } from "../db/client";
import type { SyncQueueItem } from "../types";

type SyncQueueRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: "create" | "update" | "delete";
  payload: string;
  status: "pending" | "synced" | "failed";
  created_at: string;
  synced_at: string | null;
  retry_count: number;
  last_error: string | null;
};

export async function enqueueSyncEvent(input: {
  entityType: "todo";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
}): Promise<SyncQueueItem> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO sync_queue (
      id, entity_type, entity_id, operation, payload, status, created_at, synced_at, retry_count, last_error
    ) VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6, NULL, 0, NULL)`,
    [
      id,
      input.entityType,
      input.entityId,
      input.operation,
      JSON.stringify(input.payload),
      createdAt,
    ]
  );

  return {
    id,
    entityType: input.entityType,
    entityId: input.entityId,
    operation: input.operation,
    payload: input.payload,
    status: "pending",
    createdAt,
    syncedAt: null, 
    retryCount: 0,
    lastError: null,
  };
}

export async function getPendingSyncEvents(): Promise<SyncQueueItem[]> {
  const db = await getDb();

  const rows = await db.select<SyncQueueRow[]>(
    `SELECT
      id, entity_type, entity_id, operation, payload, status,
      created_at, synced_at, retry_count, last_error
     FROM sync_queue
     WHERE status IN ('pending', 'failed')
       AND retry_count < 5
     ORDER BY created_at ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type as "todo",
    entityId: row.entity_id,
    operation: row.operation,
    payload: JSON.parse(row.payload),
    status: row.status,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
    retryCount: row.retry_count,
    lastError: row.last_error,
  }));
}

export async function markSyncEventSynced(id: string): Promise<void> {
  const db = await getDb();
  const syncedAt = new Date().toISOString();

  await db.execute(
    `UPDATE sync_queue
     SET status = 'synced', synced_at = ?1
     WHERE id = ?2`,
    [syncedAt, id]
  );
}

export async function markSyncEventFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  const db = await getDb();

  await db.execute(
    `UPDATE sync_queue
     SET status = 'failed',
         retry_count = retry_count + 1,
         last_error = ?1
     WHERE id = ?2`,
    [errorMessage, id]
  );
}