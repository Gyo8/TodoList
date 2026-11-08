import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Task } from '../domain/task';

export interface RitmoSchema extends DBSchema {
  tasks: { key: string; value: Task; indexes: { 'by-created': string } };
  settings: { key: string; value: { key: string; value: unknown } };
}
export const DATABASE_NAME = 'ritmo-local';
export const DATABASE_VERSION = 1;
export async function openDatabase(name = DATABASE_NAME): Promise<IDBPDatabase<RitmoSchema>> {
  const db = await openDB<RitmoSchema>(name, DATABASE_VERSION, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        const tasks = database.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('by-created', 'createdAt');
        database.createObjectStore('settings', { keyPath: 'key' });
      }
    },
    blocked() { window.dispatchEvent(new Event('ritmo:database-blocked')); },
    blocking() { db.close(); window.dispatchEvent(new Event('ritmo:database-blocked')); },
  });
  return db;
}
