import { supabase } from "../lib/supabaseClient";
import {
  getPendingSyncEvents,
  markSyncEventSynced,
  markSyncEventFailed,
  pruneSyncedEvents,
  hasPendingEvents,
} from "../repositories/syncQueueRepository";
import { markTodoAsSynced } from "../repositories/todoRepository";
import type { SyncQueueItem } from "../types";

export const syncService = {
  async syncPendingEvents(): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    const events = await getPendingSyncEvents();
    const affectedEntities = new Set<string>();

    for (const event of events) {
      try {
        await syncEvent(event);
        await markSyncEventSynced(event.id);
        
        if (event.entityType === "todo") {
          affectedEntities.add(event.entityId);
        }
        
        synced++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await markSyncEventFailed(event.id, errorMessage);
        failed++;
      }
    }

    // After processing the batch, update the synced flag for todos that no longer have pending events
    for (const entityId of affectedEntities) {
      const stillPending = await hasPendingEvents(entityId);
      if (!stillPending) {
        await markTodoAsSynced(entityId);
      }
    }

    try {
      await pruneSyncedEvents(7);
    } catch (e) {
      console.error("Failed to prune sync queue", e);
    }

    return { synced, failed };
  },
};

async function syncEvent(event: SyncQueueItem): Promise<void> {
  const snakeCasePayload = toSnakeCase(event.payload);

  if (event.operation === "create" || event.operation === "update") {
    const { error } = await supabase.from("todos").upsert(
      {
        ...snakeCasePayload,
        id: event.entityId,
      },
      { onConflict: "id" }
    );
    if (error) throw new Error(error.message);
  } else if (event.operation === "delete") {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", event.entityId);
    if (error) throw new Error(error.message);
  }
}

function toSnakeCase(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    // If value is a plain object, recurse (though not currently needed for this schema)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
       result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
    } else {
       result[snakeKey] = value;
    }
  }
  return result;
}
