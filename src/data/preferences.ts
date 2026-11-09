import {openDatabase} from './database';
let current:{theme:string;weekStart:0|1;timeZone:string}={theme:'system',weekStart:1,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone};
export const getPreferences=()=>current;
export async function loadPreferences(){const db=await openDatabase();try{const settings=await db.getAll('settings');const find=(key:string)=>settings.find(s=>s.key===key)?.value;current={theme:find('theme') as string??'system',weekStart:find('weekStart') as 0|1??1,timeZone:find('timeZone') as string??Intl.DateTimeFormat().resolvedOptions().timeZone};return current;}finally{db.close();}}
