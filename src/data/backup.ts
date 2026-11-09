import type {IDBPDatabase} from 'idb';
import {assertFreshDatabase,DATABASE_VERSION,type RitmoSchema} from './database';
import {validDate,validateHabit,type Habit} from '../domain/habit';
import {validateDraft,type Task} from '../domain/task';
import type {Tag,SavedView,TaskFilter} from '../domain/views';

export const MAX_BACKUP_BYTES=10*1024*1024;
export const backupStores=['tasks','habits','tags','views','focus','settings'] as const;
export interface Backup {
  app:'ritmo';formatVersion:1;schemaVersion:3;exportedAt:string;
  data:{tasks:Task[];habits:Habit[];tags:Tag[];views:SavedView[];focus:{date:string;taskIds:string[]}[];settings:{key:string;value:unknown}[]};
}
function fail(message:string):never{throw new Error('Respaldo inválido: '+message);}
function obj(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))fail('se esperaba un objeto.');return v as Record<string,unknown>;}
function str(v:unknown,max=128,empty=false):string{if(typeof v!=='string'||v.length>max||!empty&&!v.trim())fail('texto ausente o demasiado largo.');return v;}
function arr(v:unknown,max=10000):unknown[]{if(!Array.isArray(v)||v.length>max)fail('lista ausente o demasiado grande.');return v;}
function num(v:unknown,min=1,max=Number.MAX_SAFE_INTEGER):number{if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)fail('número fuera de rango.');return v;}
function bool(v:unknown):boolean{if(typeof v!=='boolean')fail('estado no válido.');return v;}
function date(v:unknown):string{const s=str(v,10);if(!validDate(s))fail('fecha no válida.');return s;}
function stamp(v:unknown):string{const s=str(v,32);if(!Number.isFinite(Date.parse(s))||new Date(s).toISOString()!==s)fail('fecha y hora no válidas.');return s;}
function nullable<T>(v:unknown,fn:(v:unknown)=>T):T|null{return v===null?null:fn(v);}
function choice<T extends string>(v:unknown,values:readonly T[]):T{if(typeof v!=='string'||!values.includes(v as T))fail('opción desconocida.');return v as T;}
function ids(v:unknown,max=1000):string[]{const a=arr(v,max).map(x=>str(x));unique(a);return a;}
function unique(values:string[]){if(new Set(values).size!==values.length)fail('identificadores duplicados.');}
function color(v:unknown):string{const s=str(v,7);if(!/^#[0-9a-f]{6}$/i.test(s))fail('color no válido.');return s;}
function filter(v:unknown):TaskFilter{const f=obj(v);return {state:choice(f.state,['pending','completed','all','archived','trash']),dateMode:choice(f.dateMode,['all','today','upcoming','undated']),priority:choice(f.priority,['none','low','medium','high','all']),tagIds:ids(f.tagIds),tagMode:choice(f.tagMode,['any','all']),sort:choice(f.sort,['created','priority','planned','due']),plannedFrom:f.plannedFrom===''?'':date(f.plannedFrom),plannedTo:f.plannedTo===''?'':date(f.plannedTo),dueFrom:f.dueFrom===''?'':date(f.dueFrom),dueTo:f.dueTo===''?'':date(f.dueTo)};}
export function validateBackup(value:unknown):Backup{
  const root=obj(value);
  if(root.app!=='ritmo'||root.formatVersion!==1||root.schemaVersion!==DATABASE_VERSION)fail('formato o versión incompatible. Usa un respaldo de esta versión de Ritmo.');
  const source=obj(root.data);
  const tasks=arr(source.tasks).map(v=>{const t=obj(v);const draft=validateDraft({title:str(t.title,200),notes:str(t.notes,5000,true),priority:choice(t.priority,['none','low','medium','high']),plannedDate:nullable(t.plannedDate,date),dueDate:nullable(t.dueDate,date),estimatedMinutes:nullable(t.estimatedMinutes,v=>num(v)),tagIds:ids(t.tagIds)});return {...draft,id:str(t.id),createdAt:stamp(t.createdAt),updatedAt:stamp(t.updatedAt),completedAt:nullable(t.completedAt,stamp),archivedAt:nullable(t.archivedAt,stamp),deletedAt:nullable(t.deletedAt,stamp),revision:num(t.revision)};});
  const tags=arr(source.tags,1000).map(v=>{const t=obj(v);return {id:str(t.id),name:str(t.name,40),color:color(t.color)};});
  const views=arr(source.views,1000).map(v=>{const t=obj(v);return {id:str(t.id),name:str(t.name,60),filter:filter(t.filter)};});
  const habits:Habit[]=arr(source.habits,1000).map(v=>{
    const h=obj(v);const rules=arr(h.rules,10000).map(v=>{const r=obj(v);const days=arr(r.days,7).map(v=>num(v,0,6));unique(days.map(String));return {from:date(r.from),days,target:num(r.target,1,7)};});
    if(!rules.length)fail('hábito sin frecuencia.');
    const d=validateHabit({name:str(h.name,120),description:str(h.description,1000,true),tagId:nullable(h.tagId,v=>str(v)),icon:str(h.icon,8),color:color(h.color),mode:choice(h.mode,['fixed','weekly']),startDate:date(h.startDate),weekStart:num(h.weekStart,0,1) as 0|1,timeZone:str(h.timeZone,100),days:rules[0].days,target:rules[0].target});
    if(rules[0].from!==d.startDate||rules.some((r,i)=>i>0&&r.from<=rules[i-1].from)||d.mode==='fixed'&&rules.some(r=>!r.days.length))fail('historial de frecuencias inconsistente.');
    const breaks=arr(h.breaks,10000).map(v=>{const b=obj(v),from=date(b.from),to=nullable(b.to,date);if(to&&to<from)fail('pausa con fechas invertidas.');return {from,to,kind:choice(b.kind,['pause','archive','trash'])};});
    for(const k of ['pause','archive','trash'])if(breaks.filter(b=>b.kind===k&&!b.to).length>1)fail('periodos abiertos duplicados.');
    const records=arr(h.records,50000).map(date);unique(records);if(records.some(d=>d<rules[0].from))fail('registro anterior al inicio.');
    const archived=bool(h.archived),deletedAt=nullable(h.deletedAt,stamp);
    if(archived!==breaks.some(b=>b.kind==='archive'&&!b.to)||!!deletedAt!==breaks.some(b=>b.kind==='trash'&&!b.to))fail('archivo o papelera inconsistentes.');
    return {id:str(h.id),name:d.name,description:d.description,tagId:d.tagId,icon:d.icon,color:d.color,mode:d.mode,startDate:d.startDate,weekStart:d.weekStart,timeZone:d.timeZone,rules,breaks,records:[...records].sort(),archived,deletedAt,createdAt:stamp(h.createdAt),updatedAt:stamp(h.updatedAt),revision:num(h.revision)};
  });
  const focus=arr(source.focus,10000).map(v=>{const f=obj(v);return {date:date(f.date),taskIds:ids(f.taskIds,3)};});
  const settings=arr(source.settings,10).map(v=>{const s=obj(v),key=choice(s.key,['theme','weekStart','timeZone','lastBackupAt']);let value:unknown;
    if(key==='theme')value=choice(s.value,['system','light','dark']);else if(key==='weekStart')value=num(s.value,0,1);else if(key==='lastBackupAt')value=stamp(s.value);else{value=str(s.value,100);try{new Intl.DateTimeFormat('es',{timeZone:value as string}).format();}catch{fail('zona horaria desconocida.');}}return {key,value};});
  for(const list of [tasks,habits,tags,views])unique(list.map(t=>t.id));unique(focus.map(f=>f.date));unique(settings.map(s=>s.key));
  unique(tags.map(t=>t.name.trim().toLocaleLowerCase()));
  const tagIds=new Set(tags.map(t=>t.id)),taskIds=new Set(tasks.map(t=>t.id));
  if(tasks.some(t=>t.tagIds.some(id=>!tagIds.has(id)))||habits.some(h=>h.tagId&&!tagIds.has(h.tagId))||focus.some(f=>f.taskIds.some(id=>!taskIds.has(id))))fail('hay referencias a tareas o etiquetas inexistentes.');
  // Saved views may deliberately retain IDs of deleted tags, so they never silently broaden.
  return {app:'ritmo',formatVersion:1,schemaVersion:3,exportedAt:stamp(root.exportedAt),data:{tasks,habits,tags,views,focus,settings}};
}
export function parseBackup(text:string):Backup{
  if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)fail('el archivo supera 10 MB.');
  let data:unknown;try{data=JSON.parse(text);}catch{fail('el archivo no contiene JSON válido.');}
  return validateBackup(data);
}
export async function exportBackup(db:IDBPDatabase<RitmoSchema>):Promise<Backup>{
  const tx=db.transaction([...backupStores],'readonly');
  const [tasks,habits,tags,views,focus,settings]=await Promise.all(backupStores.map(name=>tx.objectStore(name).getAll()));await tx.done;
  const backup=validateBackup({app:'ritmo',formatVersion:1,schemaVersion:3,exportedAt:new Date().toISOString(),data:{tasks,habits,tags,views,focus,settings:settings.filter(s=>'key' in s&&s.key!=='_generation')}});
  if(new TextEncoder().encode(JSON.stringify(backup)).byteLength>MAX_BACKUP_BYTES)throw new Error('El respaldo supera el límite de 10 MB. No se exportó una copia parcial.');
  return backup;
}
export async function restoreBackup(db:IDBPDatabase<RitmoSchema>,input:unknown):Promise<void>{
  const backup=validateBackup(input);const tx=db.transaction([...backupStores],'readwrite'),done=tx.done;void done.catch(()=>{});
  try{
    await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));
    for(const name of backupStores)await tx.objectStore(name).clear();
    for(const name of backupStores)for(const value of backup.data[name])await tx.objectStore(name).add(value);
    await tx.objectStore('settings').put({key:'_generation',value:crypto.randomUUID()});
    await done;
  }catch(e){try{tx.abort();}catch{}await done.catch(()=>{});throw new Error('No se pudo restaurar. La transacción se revirtió y los datos anteriores se conservaron.',{cause:e});}
}
export function backupSummary(b:Backup){return {tareas:b.data.tasks.length,hábitos:b.data.habits.length,registros:b.data.habits.reduce((n,h)=>n+h.records.length,0),etiquetas:b.data.tags.length,vistas:b.data.views.length,papelera:b.data.tasks.filter(t=>t.deletedAt).length+b.data.habits.filter(h=>h.deletedAt).length};}
