export interface Todo {
    id : string;
    title : string;
    description? : string;
    completed : boolean;
    createdAt : string;
    updatedAt : string;
    deletedAt?:string|null;
    synced: boolean;
}

export interface SyncQueueItem{
    id : string;
    entityType : 'todo';
    entityId:string;
    operation : 'create' | 'update' | 'delete';
    payload : Record<string,unknown>;
    status : 'pending' | 'synced' | 'failed';
    createdAt : string;
    syncedAt?:string | null;
    retryCount : number;
    lastError?:string | null;
}