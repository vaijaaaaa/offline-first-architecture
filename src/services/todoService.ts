import type { Todo } from "../types";
import {
  createTodo,
  getTodos,
  toggleTodoCompleted,
  deleteTodo,
  updateTodo,
} from "../repositories/todoRepository";
import { enqueueSyncEvent } from "../repositories/syncQueueRepository";

export const todoService = {
  async create(title: string, description?: string): Promise<Todo> {
    const todo = await createTodo(title, description);

    await enqueueSyncEvent({
      entityType: "todo",
      entityId: todo.id,
      operation: "create",
      payload: {
        id: todo.id,
        title: todo.title,
        description: todo.description ?? null,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        deletedAt: todo.deletedAt ?? null,
      },
    });

    return todo;
  },

  async list(): Promise<Todo[]> {
    return getTodos();
  },

  async toggleComplete(id: string, completed: boolean): Promise<void> {
    await toggleTodoCompleted(id, completed);

    await enqueueSyncEvent({
      entityType: "todo",
      entityId: id,
      operation: "update",
      payload: { completed },
    });
  },

  async remove(id: string): Promise<void> {
    await deleteTodo(id);

    await enqueueSyncEvent({
      entityType: "todo",
      entityId: id,
      operation: "delete",
      payload: {},
    });
  },

  async edit(
    id: string,
    updates: { title?: string; description?: string; completed?: boolean }
  ): Promise<void> {
    await updateTodo(id, updates);

    await enqueueSyncEvent({
      entityType: "todo",
      entityId: id,
      operation: "update",
      payload: updates,
    });
  },
};