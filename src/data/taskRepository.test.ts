import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openDatabase } from './database';
import { taskRepository } from './taskRepository';
import { createTask } from '../domain/task';

describe('persistencia local',()=>{
  it('conserva una tarea y su cumplimiento después de cerrar y reabrir la base',async()=>{
    const name=crypto.randomUUID();let db=await openDatabase(name);let repo=taskRepository(db);
    const task=createTask('Estudiar','high','2026-11-08');await repo.add(task);await repo.setCompleted(task.id,true);db.close();
    db=await openDatabase(name);repo=taskRepository(db);const [saved]=await repo.list();
    expect(saved.title).toBe('Estudiar');expect(saved.completedAt).not.toBeNull();expect(saved.revision).toBe(2);
    await repo.setCompleted(task.id,false);expect((await repo.list())[0].completedAt).toBeNull();db.close();
  });
  it('rechaza duplicados sin sobrescribir el registro anterior',async()=>{
    const db=await openDatabase(crypto.randomUUID()),repo=taskRepository(db),task=createTask('Original','none',null);
    await repo.add(task);await expect(repo.add({...task,title:'Duplicada'})).rejects.toThrow();expect((await repo.list())[0].title).toBe('Original');db.close();
  });
  it('no confirma escrituras cuando la base está cerrada',async()=>{
    const db=await openDatabase(crypto.randomUUID()),repo=taskRepository(db);db.close();
    await expect(repo.add(createTask('Sin guardar','none',null))).rejects.toThrow();
  });
  it('rechaza títulos vacíos y demasiado largos',()=>{
    expect(()=>createTask('  ','none',null)).toThrow();expect(()=>createTask('x'.repeat(201),'none',null)).toThrow();
  });
});
