import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {openDB} from 'idb';
import {openDatabase} from '../data/database';
import {habitRepository} from '../data/habitRepository';
import {createHabit,recordHabit,weekSummary,monthSummary,editHabit,changeHabitStatus,comparison,eligible,dateState,todayIn,type HabitDraft} from './habit';
const draft:HabitDraft={name:'Leer',description:'10 minutos',tagId:null,icon:'📖',color:'#285b42',mode:'fixed',startDate:'2026-10-01',weekStart:1,timeZone:'America/Mexico_City',days:[6],target:4};
describe('reglas del seguimiento',()=>{
  it('cierra semanas de domingo a sábado y conserva su calendario al editar',()=>{
    let h=createHabit({...draft,mode:'weekly',weekStart:0,startDate:'2026-10-25'});
    for(const date of ['2026-11-01','2026-11-02','2026-11-03','2026-11-04'])h=recordHabit(h,date,true,'2026-11-08');
    expect(weekSummary(h,'2026-11-07','2026-11-08')).toMatchObject({done:4,goal:4,percent:100,closed:true});
    expect(weekSummary(h,'2026-11-08','2026-11-08')).toMatchObject({done:0,closed:false});
    expect(()=>editHabit(h,{...draft,mode:'weekly',weekStart:1,startDate:'2026-10-25'})).toThrow('historial');
    expect(()=>editHabit(h,{...draft,mode:'weekly',weekStart:0,startDate:'2026-10-25',timeZone:'UTC'})).toThrow('historial');
  });
  it('conserva registros distintos desde dos conexiones y rechaza edición antigua',async()=>{
    const name=crypto.randomUUID(),a=await openDatabase(name),b=await openDatabase(name);
    try{
      const ra=habitRepository(a),rb=habitRepository(b),h=await ra.add({...draft,mode:'weekly'});
      await Promise.all([ra.record(h.id,'2026-11-02',true),rb.record(h.id,'2026-11-03',true)]);
      expect((await rb.list())[0].records).toEqual(['2026-11-02','2026-11-03']);
      await expect(rb.edit(h.id,{...draft,mode:'weekly',name:'Edición antigua'},h.revision)).rejects.toThrow('cambió');
      expect((await ra.list())[0].name).toBe('Leer');
    }finally{a.close();b.close();}
  });
  it('solo considera sábados, sin fallos en días futuros',()=>{let h=createHabit(draft);expect(eligible(h,'2026-11-06')).toBe(false);expect(dateState(h,'2026-11-07','2026-11-06')).toBe('future');h=recordHabit(h,'2026-11-07',true,'2026-11-08');expect(weekSummary(h,'2026-11-07','2026-11-09')).toMatchObject({done:1,goal:1,percent:100,closed:true});expect(weekSummary(h,'2026-09-01','2026-11-09').percent).toBeNull();});
  it('cuatro fechas distintas son 100%; extras no inflan ni duplican',()=>{let h=createHabit({...draft,mode:'weekly'});for(const d of ['02','03','04','05','06'])h=recordHabit(h,'2026-11-'+d,true,'2026-11-09');h=recordHabit(h,'2026-11-02',true,'2026-11-09');expect(h.records).toHaveLength(5);expect(weekSummary(h,'2026-11-02','2026-11-09')).toMatchObject({done:5,goal:4,percent:100,extra:1});expect(dateState(h,'2026-11-08','2026-11-09')).toBe('free');});
  it('rechaza futuro, descansos y fechas anteriores al inicio; permite corregir',()=>{let h=createHabit(draft);expect(()=>recordHabit(h,'2026-11-14',true,'2026-11-08')).toThrow();expect(()=>recordHabit(h,'2026-11-06',true,'2026-11-08')).toThrow();expect(()=>recordHabit(h,'2026-09-26',true,'2026-11-08')).toThrow();h=recordHabit(h,'2026-11-07',true,'2026-11-08');expect(recordHabit(h,'2026-11-07',false,'2026-11-08').records).toEqual([]);});
  it('excluye semanas parciales por inicio y pausas',()=>{let h=createHabit({...draft,mode:'weekly',startDate:'2026-11-04'});expect(weekSummary(h,'2026-11-04','2026-11-09')).toMatchObject({partial:true,percent:null});h=changeHabitStatus(h,'pause','2026-11-10');h=changeHabitStatus(h,'resume','2026-11-12');expect(eligible(h,'2026-11-11')).toBe(false);expect(weekSummary(h,'2026-11-09','2026-11-16').partial).toBe(true);});
  it('pausa al día siguiente si hoy ya se realizó; archivar conserva historial',()=>{let h=createHabit({...draft,mode:'weekly'});h=recordHabit(h,'2026-11-07',true,'2026-11-07');h=changeHabitStatus(h,'pause','2026-11-07');expect(h.breaks[0].from).toBe('2026-11-08');h=changeHabitStatus(h,'resume','2026-11-09');h=changeHabitStatus(h,'archive','2026-11-10');h=changeHabitStatus(h,'unarchive','2026-11-13');expect(h.records).toEqual(['2026-11-07']);expect(eligible(h,'2026-11-12')).toBe(false);expect(eligible(h,'2026-11-13')).toBe(true);});
  it('programa la frecuencia nueva sin reinterpretar semanas anteriores',()=>{let h=createHabit(draft);h=editHabit(h,{...draft,days:[1,3]},'2026-11-04');expect(h.rules[1].from).toBe('2026-11-09');expect(eligible(h,'2026-11-07')).toBe(true);expect(eligible(h,'2026-11-14')).toBe(false);expect(eligible(h,'2026-11-11')).toBe(true);});
  it('agrupa metas flexibles por semana de cierre y suma denominadores',()=>{let h=createHabit({...draft,mode:'weekly',startDate:'2026-10-26'});for(const d of ['2026-10-26','2026-10-27','2026-10-28','2026-10-29'])h=recordHabit(h,d,true,'2026-12-01');h=editHabit(h,{...draft,mode:'weekly',startDate:'2026-10-26',target:2},'2026-11-01');expect(monthSummary(h,'2026-10','2026-12-01').units).toBe(0);expect(monthSummary(h,'2026-11','2026-12-01')).toMatchObject({units:5,goal:12,done:4,percent:33});});
  it('no presenta comparación con suficiente evidencia cuando hay pocos datos',()=>{const h=createHabit({...draft,startDate:'2026-11-07'});expect(comparison(h,'2026-11-09').units).toBe(1);});
  it('respeta zona horaria y semanas en cambio de año',()=>{expect(todayIn('America/Mexico_City',new Date('2027-01-01T03:00:00Z'))).toBe('2026-12-31');const h=createHabit({...draft,mode:'weekly',startDate:'2026-12-28'});expect(weekSummary(h,'2027-01-01','2027-01-04')).toMatchObject({partial:false,closed:true});});
  it('migra una base v2 conservando sus stores',async()=>{const name=crypto.randomUUID();const old=await openDB(name,2,{upgrade(db){const t=db.createObjectStore('tasks',{keyPath:'id'});t.createIndex('by-created','createdAt');for(const name of ['tags','views'])db.createObjectStore(name,{keyPath:'id'});db.createObjectStore('settings',{keyPath:'key'});db.createObjectStore('focus',{keyPath:'date'});}});await old.put('tags',{id:'a',name:'Escuela',color:'#123456'});old.close();const db=await openDatabase(name);expect(await db.get('tags','a')).toMatchObject({name:'Escuela'});expect(await habitRepository(db).list()).toEqual([]);db.close();});
  it('persiste registros y previene duplicados con escrituras simultáneas',async()=>{const name=crypto.randomUUID();let db=await openDatabase(name);const r=habitRepository(db),h=await r.add({...draft,mode:'weekly'});await Promise.all([r.record(h.id,'2026-11-02',true),r.record(h.id,'2026-11-02',true)]);db.close();db=await openDatabase(name);expect((await habitRepository(db).list())[0].records).toEqual(['2026-11-02']);db.close();});
});
