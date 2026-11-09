import 'fake-indexeddb/auto';
import {describe,it,expect,vi,afterEach} from 'vitest';
import {openDatabase} from './database';
import {taskRepository} from './taskRepository';
import {habitRepository} from './habitRepository';
import {organizerRepository} from './organizerRepository';
import {exportBackup,restoreBackup,parseBackup,validateBackup,MAX_BACKUP_BYTES,type Backup} from './backup';
import {createTask} from '../domain/task';
import {defaultFilter} from '../domain/views';

async function fixture(){
  const db=await openDatabase(crypto.randomUUID()),o=organizerRepository(db),t=taskRepository(db),h=habitRepository(db);
  await o.saveTag({id:'school',name:'Escuela',color:'#285b42'});
  const task={...createTask('Repasar','high','2026-11-08'),tagIds:['school'],notes:'Notas privadas'};await t.add(task);await t.setStatus(task.id,'trash');
  await o.saveView({id:'view',name:'Escuela pendiente',filter:{...defaultFilter,tagIds:['school']}});
  const habit=await h.add({name:'Lectura',description:'10 minutos',tagId:'school',icon:'📖',color:'#285b42',mode:'weekly',startDate:'2026-11-01',weekStart:1,timeZone:'America/Mexico_City',days:[],target:4});
  await h.record(habit.id,'2026-11-02',true);await h.status(habit.id,'archive');
  await db.put('focus',{date:'2026-11-08',taskIds:[task.id]});await db.put('settings',{key:'theme',value:'dark'});
  const backup=await exportBackup(db);return {db,backup,task,habit};
}
afterEach(()=>vi.restoreAllMocks());
describe('respaldo y restauración',()=>{
  it('reproduce todas las entidades, historial, papelera y preferencias',async()=>{
    const f=await fixture(),target=await openDatabase(crypto.randomUUID());await taskRepository(target).add(createTask('Se reemplaza','none',null));
    const parsed=parseBackup(JSON.stringify(f.backup));await restoreBackup(target,parsed);expect((await exportBackup(target)).data).toEqual(f.backup.data);expect(await target.get('settings','_generation')).toBeTruthy();target.close();f.db.close();
  });
  it('rechaza JSON roto, versiones incompatibles y listas ausentes sin alterar los datos',async()=>{
    const f=await fixture();expect(()=>parseBackup('{')).toThrow();expect(()=>validateBackup({...f.backup,schemaVersion:99})).toThrow('incompatible');
    await expect(restoreBackup(f.db,{...f.backup,data:{...f.backup.data,habits:undefined}})).rejects.toThrow();expect((await exportBackup(f.db)).data).toEqual(f.backup.data);f.db.close();
  });
  it('rechaza duplicados, referencias rotas y fechas imposibles',async()=>{
    const f=await fixture(),b=f.backup;
    expect(()=>validateBackup({...b,data:{...b.data,tasks:[...b.data.tasks,...b.data.tasks]}})).toThrow('duplicados');
    expect(()=>validateBackup({...b,data:{...b.data,tags:[]}})).toThrow('referencias');
    expect(()=>validateBackup({...b,data:{...b.data,tasks:[{...b.data.tasks[0],dueDate:'2026-02-30'}]}})).toThrow();
    expect(()=>validateBackup({...b,data:{...b.data,habits:[{...b.data.habits[0],records:['2026-11-02','2026-11-02']}]}})).toThrow();f.db.close();
  });
  it('limita tamaño y excluye claves de configuración no admitidas',async()=>{
    expect(()=>parseBackup(' '.repeat(MAX_BACKUP_BYTES+1))).toThrow('10 MB');const f=await fixture();expect(()=>validateBackup({...f.backup,data:{...f.backup.data,settings:[{key:'apiKey',value:'no-admitido'}]}})).toThrow();f.db.close();
  });
  it('revierte todos los stores si falla una escritura después de borrarlos',async()=>{
    const f=await fixture(),db=await openDatabase(crypto.randomUUID()),task=createTask('No perder','none',null);await taskRepository(db).add(task);const before=(await exportBackup(db)).data;
    const original=IDBObjectStore.prototype.add;
    vi.spyOn(IDBObjectStore.prototype,'add').mockImplementation(function(this:IDBObjectStore,value:unknown,key?:IDBValidKey){if(this.name==='habits')throw new DOMException('Simulación de falta de espacio','QuotaExceededError');return key===undefined?original.call(this,value):original.call(this,value,key);});
    await expect(restoreBackup(db,f.backup)).rejects.toThrow('revirtió');expect((await exportBackup(db)).data).toEqual(before);db.close();f.db.close();
  });
  it('bloquea escrituras desde conexiones anteriores a una restauración',async()=>{
    const name=crypto.randomUUID(),db=await openDatabase(name),stale=await openDatabase(name);const task=createTask('Anterior','none',null);await taskRepository(db).add(task);const backup=await exportBackup(db);await restoreBackup(db,backup);
    await expect(taskRepository(stale).setCompleted(task.id,true)).rejects.toThrow('Recarga');
    await expect(organizerRepository(stale).saveTag({id:'old',name:'Antigua',color:'#123456'})).rejects.toThrow('Recarga');
    await expect(taskRepository(stale).add(createTask('Antigua','none',null))).rejects.toThrow('Recarga');
    const fresh=await openDatabase(name);await taskRepository(fresh).setCompleted(task.id,true);expect((await taskRepository(fresh).list())[0].completedAt).not.toBeNull();fresh.close();stale.close();db.close();
  });
  it('mantiene filtros con etiquetas eliminadas y elimina campos inesperados',async()=>{
    const f=await fixture();await organizerRepository(f.db).deleteTag('school');const b=await exportBackup(f.db);expect(b.data.views[0].filter.tagIds).toEqual(['school']);const raw=JSON.parse(JSON.stringify(b));raw.data.tasks[0].extra={script:'no conservar'};expect((validateBackup(raw).data.tasks[0] as unknown as Record<string,unknown>).extra).toBeUndefined();f.db.close();
  });
});
