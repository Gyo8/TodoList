import {localDate,type Task,type Priority} from './task';
export interface Tag {id:string;name:string;color:string}
export interface TaskFilter {
  state:'pending'|'completed'|'all'|'archived'|'trash';
  dateMode:'all'|'today'|'upcoming'|'undated';
  priority:Priority|'all';tagIds:string[];tagMode:'any'|'all';
  plannedFrom:string;plannedTo:string;dueFrom:string;dueTo:string;
  sort:'created'|'priority'|'planned'|'due';
}
export interface SavedView {id:string;name:string;filter:TaskFilter}
export const defaultFilter:TaskFilter={state:'pending',dateMode:'all',priority:'all',tagIds:[],tagMode:'any',plannedFrom:'',plannedTo:'',dueFrom:'',dueTo:'',sort:'created'};
export function filterTasks(tasks:Task[],filter:TaskFilter,today=localDate()):Task[]{
  const next=new Date(`${today}T12:00:00`);next.setDate(next.getDate()+7);const end=localDate(next);
  const range=(d:string|null,a:string,b:string)=>(!a&&!b)||!!d&&(!a||d>=a)&&(!b||d<=b);
  const result=tasks.filter(t=>{
    if(filter.state==='trash'?!t.deletedAt:!!t.deletedAt)return false;
    if(filter.state!=='trash'&&(filter.state==='archived'?!t.archivedAt:!!t.archivedAt))return false;
    if(filter.state==='pending'&&t.completedAt||filter.state==='completed'&&!t.completedAt)return false;
    if(filter.priority!=='all'&&t.priority!==filter.priority)return false;
    if(filter.dateMode==='today'&&t.plannedDate!==today)return false;
    if(filter.dateMode==='undated'&&(t.plannedDate||t.dueDate))return false;
    if(filter.dateMode==='upcoming'&&![t.plannedDate,t.dueDate].some(d=>d&&d>today&&d<=end))return false;
    if(!range(t.plannedDate,filter.plannedFrom,filter.plannedTo)||!range(t.dueDate,filter.dueFrom,filter.dueTo))return false;
    if(filter.tagIds.length && !(filter.tagMode==='all'?filter.tagIds.every(id=>t.tagIds.includes(id)):filter.tagIds.some(id=>t.tagIds.includes(id))))return false;
    return true;
  });
  const ranks={high:0,medium:1,low:2,none:3};
  return result.sort((a,b)=>{
    let cmp=0;
    if(filter.sort==='priority')cmp=ranks[a.priority]-ranks[b.priority];
    if(filter.sort==='planned'||filter.sort==='due'){const key=filter.sort==='planned'?'plannedDate':'dueDate';cmp=(a[key]??'9999').localeCompare(b[key]??'9999');}
    return cmp || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);
  });
}
