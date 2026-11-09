import type { IDBPDatabase } from 'idb';
import { validateDraft, type Task, type TaskDraft } from '../domain/task';
import { assertFreshDatabase, type RitmoSchema } from './database';
import { syncManager } from '../services/syncService';

export interface TaskRepository {
  list(): Promise<Task[]>;
  add(task: Task): Promise<void>;
  setCompleted(id: string, completed: boolean): Promise<void>;
  edit(id: string, draft: TaskDraft, expectedRevision: number): Promise<void>;
  setStatus(id: string, status: 'archive' | 'trash' | 'restore' | 'unarchive'): Promise<void>;
}

export function taskRepository(db: IDBPDatabase<RitmoSchema>): TaskRepository {
  async function change(id: string, transform: (t: Task) => Task) {
    const tx = db.transaction(['tasks', 'settings'], 'readwrite');
    const done = tx.done;
    void done.catch(() => {});
    try {
      await assertFreshDatabase(db, (key) => tx.objectStore('settings').get(key));
      const t = await tx.objectStore('tasks').get(id);
      if (!t) throw new Error('La tarea ya no existe.');
      const updated = transform(t);
      const toSave = {
        ...updated,
        updatedAt: new Date().toISOString(),
        revision: t.revision + 1,
      };
      await tx.objectStore('tasks').put(toSave);
      await done;
      syncManager.pushTask(toSave).catch(() => {});
    } catch (e) {
      try {
        tx.abort();
      } catch {}
      await done.catch(() => {});
      throw e;
    }
  }

  return {
    async edit(id, draft, expectedRevision) {
      const valid = validateDraft(draft);
      await change(id, (t) => {
        if (t.revision !== expectedRevision) {
          throw new Error('La tarea cambió en otra pestaña. Cancela y vuelve a abrirla antes de editar.');
        }
        return { ...t, ...valid };
      });
    },

    async setStatus(id, status) {
      await change(id, (t) => ({
        ...t,
        deletedAt:
          status === 'trash'
            ? new Date().toISOString()
            : status === 'restore'
            ? null
            : t.deletedAt,
        archivedAt:
          status === 'archive'
            ? new Date().toISOString()
            : status === 'unarchive'
            ? null
            : t.archivedAt,
      }));
    },

    async list() {
      return (await db.getAllFromIndex('tasks', 'by-created')).reverse();
    },

    async add(task) {
      const tx = db.transaction(['tasks', 'settings'], 'readwrite');
      await assertFreshDatabase(db, (key) => tx.objectStore('settings').get(key));
      await Promise.all([tx.objectStore('tasks').add(task), tx.done]);
      syncManager.pushTask(task).catch(() => {});
    },

    async setCompleted(id, completed) {
      const tx = db.transaction(['tasks', 'settings'], 'readwrite');
      await assertFreshDatabase(db, (key) => tx.objectStore('settings').get(key));
      const task = await tx.objectStore('tasks').get(id);
      if (!task) {
        await tx.done;
        throw new Error('La tarea ya no existe. Recarga la lista.');
      }
      const now = new Date().toISOString();
      const updated: Task = {
        ...task,
        completedAt: completed ? now : null,
        updatedAt: now,
        revision: task.revision + 1,
      };
      await Promise.all([tx.objectStore('tasks').put(updated), tx.done]);
      syncManager.pushTask(updated).catch(() => {});
    },
  };
}
