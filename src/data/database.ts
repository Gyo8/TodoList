import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Task } from '../domain/task';
import type { Tag, SavedView } from '../domain/views';
import type {Habit} from '../domain/habit';

export interface RitmoSchema extends DBSchema {
  tasks: { key: string; value: Task; indexes: { 'by-created': string } };
  settings: { key: string; value: { key: string; value: unknown } };
  tags:{key:string;value:Tag};
  views:{key:string;value:SavedView};
  focus:{key:string;value:{date:string;taskIds:string[]}};
  habits:{key:string;value:Habit};
}
export const DATABASE_NAME = 'ritmo-local';
export const DATABASE_VERSION = 3;
const generations=new WeakMap<object,unknown>();
export async function assertFreshDatabase(db:IDBPDatabase<RitmoSchema>,get:(key:string)=>Promise<{key:string;value:unknown}|undefined>){
  const generation=(await get('_generation'))?.value??'';
  if(generation!==(generations.get(db)??''))throw new Error('Los datos fueron restaurados en otra sesión. Recarga Ritmo antes de guardar cambios.');
}
export const openDatabase = async function (name = DATABASE_NAME): Promise<IDBPDatabase<RitmoSchema>> {
  const db = await openDB<RitmoSchema>(name, DATABASE_VERSION, {
    async upgrade(database, oldVersion, _version, tx) {
      if (oldVersion < 1) {
        const tasks = database.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('by-created', 'createdAt');
        database.createObjectStore('settings', { keyPath: 'key' });
      }
      if(oldVersion<2){
        database.createObjectStore('tags',{keyPath:'id'});
        database.createObjectStore('views',{keyPath:'id'});
        database.createObjectStore('focus',{keyPath:'date'});
        let cursor=await tx.objectStore('tasks').openCursor();
        while(cursor){const t=cursor.value;await cursor.update({...t,notes:t.notes??'',dueDate:t.dueDate??null,estimatedMinutes:t.estimatedMinutes??null,tagIds:t.tagIds??[]});cursor=await cursor.continue();}
      }
      if(oldVersion<3)database.createObjectStore('habits',{keyPath:'id'});
    },
    blocked() { window.dispatchEvent(new Event('ritmo:database-blocked')); },
    blocking() { db.close(); window.dispatchEvent(new Event('ritmo:database-blocked')); },
  });
  generations.set(db,(await db.get('settings','_generation'))?.value??'');
  return db;
};
export const getDatabase = openDatabase;
