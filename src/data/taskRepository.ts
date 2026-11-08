import type { IDBPDatabase } from 'idb';
import type { Task } from '../domain/task';
import type { RitmoSchema } from './database';

export interface TaskRepository {
  list(): Promise<Task[]>;
  add(task: Task): Promise<void>;
  setCompleted(id: string, completed: boolean): Promise<void>;
}
export function taskRepository(db: IDBPDatabase<RitmoSchema>): TaskRepository {
  return {
    async list() { return (await db.getAllFromIndex('tasks','by-created')).reverse(); },
    async add(task) {
      const tx=db.transaction('tasks','readwrite');
      await Promise.all([tx.store.add(task),tx.done]);
    },
    async setCompleted(id, completed) {
      const tx=db.transaction('tasks','readwrite');
      const task=await tx.store.get(id);
      if (!task) { await tx.done; throw new Error('La tarea ya no existe. Recarga la lista.'); }
      const now=new Date().toISOString();
      await Promise.all([tx.store.put({...task, completedAt: completed ? now : null, updatedAt: now, revision: task.revision+1}),tx.done]);
    },
  };
}
