import type {IDBPDatabase} from 'idb';
import {assertFreshDatabase,type RitmoSchema} from './database';
import {changeHabitStatus,createHabit,editHabit,recordHabit,type Habit,type HabitDraft} from '../domain/habit';
export function habitRepository(db:IDBPDatabase<RitmoSchema>){
  async function change(id:string,transform:(h:Habit)=>Habit){
    const tx=db.transaction(['habits','settings'],'readwrite'),done=tx.done;void done.catch(()=>{});
    try{await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));const h=await tx.objectStore('habits').get(id);if(!h)throw new Error('El hábito no existe.');const next=transform(h);await tx.objectStore('habits').put({...next,revision:h.revision+1,updatedAt:new Date().toISOString()});await done;}
    catch(e){try{tx.abort();}catch{}await done.catch(()=>{});throw e;}
  }
  return {
    list:()=>db.getAll('habits'),
    async add(d:HabitDraft){const h=createHabit(d);const tx=db.transaction(['habits','settings'],'readwrite');await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));await Promise.all([tx.objectStore('habits').add(h),tx.done]);return h;},
    edit:(id:string,d:HabitDraft,revision:number)=>change(id,h=>{if(h.revision!==revision)throw new Error('El hábito cambió. Cancela y vuelve a abrirlo para editar.');return editHabit(h,d);}),
    record:(id:string,date:string,done:boolean)=>change(id,h=>recordHabit(h,date,done)),
    status:(id:string,action:Parameters<typeof changeHabitStatus>[1])=>change(id,h=>changeHabitStatus(h,action)),
  };
}
export type HabitRepository=ReturnType<typeof habitRepository>;
