import type { Todo } from "../types";
import {
  createTodo,
  getTodos,
  toggleTodoCompleted,
  softDeleteTodo,
  updateTodo,
} from "../repositories/todoRepository";

export const todoService = {
  async create(title: string, description?: string): Promise<Todo> {
    return createTodo(title, description);
  },

  async list(): Promise<Todo[]> {
    return getTodos();
  },

  async toggleComplete(id: string, completed: boolean): Promise<void> {
    await toggleTodoCompleted(id, completed);
  },

  async remove(id: string): Promise<void> {
    await softDeleteTodo(id);
  },

  async edit(
    id: string,
    updates: { title?: string; description?: string; completed?: boolean }
  ): Promise<void> {
    await updateTodo(id, updates);
  },
};