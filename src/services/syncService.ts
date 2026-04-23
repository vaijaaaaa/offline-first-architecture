import { supabase } from "../lib/supabaseClient";
import {
  getPendingSyncEvents,
  markSyncEventSynced,
  markSyncEventFailed,
} from "../repositories/syncQueueRepository";
import type { SyncQueueItem } from "../types";

export const syncService = {
  async syncPendingEvents(): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    const events = await getPendingSyncEvents();

    const creates = events.filter((e) => e.operation === "create");
    const updates = events.filter((e) => e.operation === "update");
    const deletes = events.filter((e) => e.operation === "delete");

    const orderedEvents = [...creates, ...updates, ...deletes];

    for (let i = 0; i < orderedEvents.length; i++) {
      const event = orderedEvents[i];
      const hasDelete = orderedEvents
        .slice(i + 1)
        .some((e) => e.entityId === event.entityId && e.operation === "delete");

      if (hasDelete && event.operation !== "delete") {
        await markSyncEventSynced(event.id);
        continue;
      }

      try {
        await syncEvent(event);
        await markSyncEventSynced(event.id);
        synced++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await markSyncEventFailed(event.id, errorMessage);
        failed++;
      }
    }

    return { synced, failed };
  },
};

async function syncEvent(event: SyncQueueItem): Promise<void> {
  const snakeCasePayload = toSnakeCase(event.payload);

  if (event.operation === "create") {
    const { error } = await supabase.from("todos").upsert(
      {
        ...snakeCasePayload,
        id: event.entityId,
      },
      { onConflict: "id" }
    );
    if (error) throw new Error(error.message);
  } else if (event.operation === "update") {
    const { error } = await supabase
      .from("todos")
      .update(snakeCasePayload)
      .eq("id", event.entityId);
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
    result[snakeKey] = value;
  }
  return result;
}