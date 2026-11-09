import 'fake-indexeddb/auto';
import {openDB} from 'idb';
import {describe,it,expect} from 'vitest';
import {openDatabase} from './database';
import {taskRepository} from './taskRepository';
import {organizerRepository} from './organizerRepository';
import {createTask,validateDraft} from '../domain/task';
import {defaultFilter,filterTasks} from '../domain/views';

describe('actualización y organización',()=>{
  it('migra la base v1 sin perder identidad, fechas o cumplimiento',async()=>{
    const name=crypto.randomUUID();const old=await openDB(name,1,{upgrade(db){const s=db.createObjectStore('tasks',{keyPath:'id'});s.createIndex('by-created','createdAt');db.createObjectStore('settings',{keyPath:'key'});}});
    const {notes,dueDate,estimatedMinutes,tagIds,...legacy}=createTask('Antes de actualizar','high','2026-11-08');legacy.completedAt='2026-11-08T10:00:00Z';
    await old.put('tasks',legacy);old.close();const db=await openDatabase(name);const t=(await taskRepository(db).list())[0];
    expect(t).toMatchObject({...legacy,notes:'',dueDate:null,estimatedMinutes:null,tagIds:[]});db.close();
  });
  it('rechaza una edición desactualizada y conserva el cambio más reciente',async()=>{
    const db=await openDatabase(crypto.randomUUID()),r=taskRepository(db),t=createTask('Original','none',null);await r.add(t);
    await r.edit(t.id,{...t,title:'Reciente'},1);await expect(r.edit(t.id,{...t,title:'Antigua'},1)).rejects.toThrow('otra pestaña');
    expect((await r.list())[0].title).toBe('Reciente');db.close();
  });
  it('archiva, elimina y restaura sin perder los detalles',async()=>{
    const db=await openDatabase(crypto.randomUUID()),r=taskRepository(db),t={...createTask('Restaurar','medium',null),notes:'Conservar',tagIds:['x']};await r.add(t);
    await r.setStatus(t.id,'archive');await r.setStatus(t.id,'trash');await r.setStatus(t.id,'restore');
    expect((await r.list())[0]).toMatchObject({notes:'Conservar',deletedAt:null,tagIds:['x']});expect((await r.list())[0].archivedAt).not.toBeNull();
    await r.setStatus(t.id,'unarchive');expect(filterTasks(await r.list(),defaultFilter)).toHaveLength(1);db.close();
  });
  it('renombra etiquetas sin perder relaciones y elimina sin borrar tareas',async()=>{
    const name=crypto.randomUUID();let db=await openDatabase(name);const r=taskRepository(db),o=organizerRepository(db),t={...createTask('Escuela','high',null),tagIds:['school']};await r.add(t);
    await o.saveTag({id:'school',name:'Escuela',color:'#285b42'});await o.saveView({id:'v',name:'Mi escuela',filter:{...defaultFilter,tagIds:['school'],sort:'priority'}});
    await o.saveTag({id:'school',name:'Estudios',color:'#123456'});expect((await r.list())[0].tagIds).toEqual(['school']);
    db.close();db=await openDatabase(name);const reopened=organizerRepository(db);const v=(await reopened.views())[0];expect(v.filter.sort).toBe('priority');expect(filterTasks(await taskRepository(db).list(),v.filter)).toHaveLength(1);
    await reopened.deleteTag('school');const tasks=await taskRepository(db).list();expect(tasks).toHaveLength(1);expect(tasks[0].tagIds).toEqual([]);expect(filterTasks(tasks,(await reopened.views())[0].filter)).toHaveLength(0);db.close();
  });
  it('limita prioridades a tres incluso con llamadas simultáneas',async()=>{
    const db=await openDatabase(crypto.randomUUID()),r=taskRepository(db),o=organizerRepository(db);const tasks=Array.from({length:4},(_,i)=>createTask('Tarea '+i,'none',null));for(const t of tasks)await r.add(t);
    const results=await Promise.allSettled(tasks.map(t=>o.toggleFocus('2026-11-08',t.id)));expect(results.filter(x=>x.status==='rejected')).toHaveLength(1);expect(await o.focus('2026-11-08')).toHaveLength(3);db.close();
  });
  it('combina filtros, maneja fechas vacías y no incluye hoy en próximas',()=>{
    const a={...createTask('A','high','2026-11-08'),tagIds:['a','b'],dueDate:'2026-11-09'};
    const b={...createTask('B','low',null),tagIds:['a']};
    expect(filterTasks([a,b],{...defaultFilter,tagIds:['a','b'],tagMode:'all'}).map(t=>t.title)).toEqual(['A']);
    expect(filterTasks([a,b],{...defaultFilter,dateMode:'undated'}).map(t=>t.title)).toEqual(['B']);
    expect(filterTasks([{...a,dueDate:null},b],{...defaultFilter,dateMode:'upcoming'},'2026-11-08')).toEqual([]);
    expect(filterTasks([b,a],{...defaultFilter,sort:'planned'}).map(t=>t.title)).toEqual(['A','B']);
    expect(filterTasks([a,b],{...defaultFilter,dueFrom:'2026-11-09',dueTo:'2026-11-09'})).toHaveLength(1);
  });
  it('valida fechas reales y duración entera',()=>{
    const t=createTask('Válida','none',null);expect(()=>validateDraft({...t,dueDate:'2026-02-30'})).toThrow();expect(()=>validateDraft({...t,estimatedMinutes:1.5})).toThrow();
  });
});
