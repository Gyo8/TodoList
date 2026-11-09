export type HabitMode='fixed'|'weekly';
export interface HabitRule {from:string;days:number[];target:number}
export interface HabitBreak {from:string;to:string|null;kind:'pause'|'archive'|'trash'}
export interface Habit {
  id:string;name:string;description:string;tagId:string|null;icon:string;color:string;
  mode:HabitMode;startDate:string;weekStart:0|1;timeZone:string;
  rules:HabitRule[];breaks:HabitBreak[];records:string[];
  archived:boolean;deletedAt:string|null;createdAt:string;updatedAt:string;revision:number;
}
export interface HabitDraft {name:string;description:string;tagId:string|null;icon:string;color:string;mode:HabitMode;startDate:string;weekStart:0|1;timeZone:string;days:number[];target:number}
export const habitIcons=['✿','📖','💧','🚶','🏋','🌙','✍'];
export function validDate(s:string):boolean{return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function addDays(s:string,n:number):string{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function dates(from:string,to:string):string[]{const out:string[]=[];for(let d=from;d<=to;d=addDays(d,1))out.push(d);return out;}
export function weekday(s:string):number{return new Date(s+'T12:00:00Z').getUTCDay();}
export function startOfWeek(s:string,start:0|1):string{return addDays(s,-((weekday(s)-start+7)%7));}
export function todayIn(zone:string,now=new Date()):string{const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return `${p.find(x=>x.type==='year')!.value}-${p.find(x=>x.type==='month')!.value}-${p.find(x=>x.type==='day')!.value}`;}
export function validateHabit(d:HabitDraft):HabitDraft{
  const name=d.name.trim();if(!name||name.length>120)throw new Error('El nombre debe tener entre 1 y 120 caracteres.');
  if(d.description.length>1000)throw new Error('La descripción admite hasta 1.000 caracteres.');
  if(!validDate(d.startDate))throw new Error('Fecha de inicio no válida.');
  if(!['fixed','weekly'].includes(d.mode)||![0,1].includes(d.weekStart))throw new Error('Frecuencia no válida.');
  if(!Number.isInteger(d.target)||d.target<1||d.target>7)throw new Error('Elige entre 1 y 7 días por semana.');
  const days=[...new Set(d.days)].sort();if(days.some(x=>!Number.isInteger(x)||x<0||x>6)||d.mode==='fixed'&&!days.length)throw new Error('Selecciona al menos un día válido.');
  if(!/^#[0-9a-f]{6}$/i.test(d.color)||!habitIcons.includes(d.icon))throw new Error('Color o icono no válido.');
  try{todayIn(d.timeZone);}catch{throw new Error('Zona horaria no válida.');}
  return {...d,name,days};
}
export function createHabit(draft:HabitDraft):Habit{
  const d=validateHabit(draft),now=new Date().toISOString();
  return {id:crypto.randomUUID(),name:d.name,description:d.description,tagId:d.tagId,icon:d.icon,color:d.color,mode:d.mode,startDate:d.startDate,weekStart:d.weekStart,timeZone:d.timeZone,rules:[{from:d.startDate,days:d.days,target:d.target}],breaks:[],records:[],archived:false,deletedAt:null,createdAt:now,updatedAt:now,revision:1};
}
export function ruleOn(h:Habit,date:string):HabitRule|undefined{return [...h.rules].reverse().find(r=>r.from<=date);}
export function activeOn(h:Habit,date:string):boolean{return date>=h.startDate&&!h.breaks.some(p=>date>=p.from&&(!p.to||date<p.to));}
export function eligible(h:Habit,date:string):boolean{const r=ruleOn(h,date);return !!r&&activeOn(h,date)&&(h.mode==='weekly'||r.days.includes(weekday(date)));}
export function dateState(h:Habit,date:string,today=todayIn(h.timeZone)):'done'|'future'|'neutral'|'pending'|'missed'|'free'{
  if(h.records.includes(date))return 'done';if(!eligible(h,date))return 'neutral';if(date>today)return 'future';if(h.mode==='weekly')return 'free';return date===today?'pending':'missed';
}
export function recordHabit(h:Habit,date:string,done:boolean,today=todayIn(h.timeZone)):Habit{
  if(!validDate(date)||date>today)throw new Error('No se pueden registrar días futuros o fechas inválidas.');
  if(h.deletedAt)throw new Error('Restaura el hábito antes de corregir registros.');
  if(!eligible(h,date)&&!(h.records.includes(date)&&!done))throw new Error('Esta fecha no corresponde al hábito o pertenece a una pausa.');
  return {...h,records:done?[...new Set([...h.records,date])].sort():h.records.filter(d=>d!==date)};
}
export function editHabit(h:Habit,draft:HabitDraft,today=todayIn(h.timeZone)):Habit{
  const d=validateHabit(draft);
  if(d.mode!==h.mode||d.startDate!==h.startDate||d.weekStart!==h.weekStart||d.timeZone!==h.timeZone)throw new Error('La modalidad, inicio, semana y zona horaria se conservan para proteger el historial.');
  const from=h.startDate>today?h.startDate:addDays(startOfWeek(today,h.weekStart),7);
  const current=ruleOn(h,from)??h.rules[0];let rules=h.rules;
  if(JSON.stringify(current.days)!==JSON.stringify(d.days)||current.target!==d.target){rules=[...h.rules.filter(r=>r.from<from),{from,days:d.days,target:d.target}];}
  return {...h,name:d.name,description:d.description,tagId:d.tagId,icon:d.icon,color:d.color,rules};
}
export function changeHabitStatus(h:Habit,action:'pause'|'resume'|'archive'|'unarchive'|'trash'|'restore',today=todayIn(h.timeZone)):Habit{
  const next=structuredClone(h);const kind=action==='pause'||action==='resume'?'pause':action==='archive'||action==='unarchive'?'archive':'trash';
  const opening=['pause','archive','trash'].includes(action);
  if(opening&&!next.breaks.some(b=>b.kind===kind&&!b.to))next.breaks.push({kind,from:h.records.includes(today)?addDays(today,1):today,to:null});
  if(!opening)next.breaks=next.breaks.map(b=>b.kind===kind&&!b.to?{...b,to:today<b.from?b.from:today}:b);
  if(action==='archive')next.archived=true;if(action==='unarchive')next.archived=false;
  if(action==='trash')next.deletedAt=new Date().toISOString();if(action==='restore')next.deletedAt=null;
  return next;
}
export interface HabitSummary {done:number;goal:number;percent:number|null;partial:boolean;closed:boolean;extra:number;units:number}
export function weekSummary(h:Habit,date:string,today=todayIn(h.timeZone)):HabitSummary{
  const from=startOfWeek(date,h.weekStart),to=addDays(from,6),ds=dates(from,to);const closed=to<today;
  if(h.mode==='fixed'){
    const opportunities=ds.filter(d=>eligible(h,d)),done=opportunities.filter(d=>d<=today&&h.records.includes(d)).length;
    return {done,goal:opportunities.length,percent:opportunities.length?Math.round(done/opportunities.length*100):null,partial:false,closed,extra:0,units:opportunities.length};
  }
  const partial=ds.some(d=>!activeOn(h,d)),goal=(ruleOn(h,to)??h.rules[0]).target,done=ds.filter(d=>d<=today&&h.records.includes(d)).length;
  if(!ds.some(d=>activeOn(h,d)))return {done,goal:0,percent:null,partial:true,closed,extra:0,units:0};
  return {done,goal,percent:partial?null:Math.round(Math.min(done/goal,1)*100),partial,closed,extra:Math.max(0,done-goal),units:partial?0:1};
}
export function monthSummary(h:Habit,month:string,today=todayIn(h.timeZone)):HabitSummary{
  const from=month+'-01',d=new Date(from+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+1);const to=addDays(d.toISOString().slice(0,10),-1);
  if(h.mode==='fixed'){
    const ds=dates(from,to).filter(d=>eligible(h,d));const done=ds.filter(d=>d<=today&&h.records.includes(d)).length;
    return {done,goal:ds.length,percent:ds.length?Math.round(done/ds.length*100):null,partial:false,closed:to<today,extra:0,units:ds.length};
  }
  let done=0,goal=0,units=0,extra=0;
  for(const end of dates(from,to).filter(d=>weekday(d)===(h.weekStart+6)%7&&d<today)){
    const s=weekSummary(h,end,today);if(s.partial)continue;done+=Math.min(s.done,s.goal);goal+=s.goal;extra+=s.extra;units++;
  }
  return {done,goal,percent:goal?Math.round(done/goal*100):null,partial:false,closed:to<today,extra,units};
}
export function comparison(h:Habit,today=todayIn(h.timeZone)):HabitSummary{
  const current=startOfWeek(today,h.weekStart);let done=0,goal=0,units=0,extra=0;
  for(let i=1;i<=4;i++){const s=weekSummary(h,addDays(current,-7*i),today);if(s.partial)continue;done+=Math.min(s.done,s.goal);goal+=s.goal;units+=s.units;extra+=s.extra;}
  return {done,goal,units,extra,closed:true,partial:false,percent:goal?Math.round(done/goal*100):null};
}
