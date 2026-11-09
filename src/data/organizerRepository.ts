import type {IDBPDatabase} from 'idb';
import {assertFreshDatabase,type RitmoSchema} from './database';
import type {SavedView,Tag} from '../domain/views';
export function organizerRepository(db:IDBPDatabase<RitmoSchema>){
  return {
    tags:()=>db.getAll('tags'),views:()=>db.getAll('views'),
    async saveTag(tag:Tag){
      const name=tag.name.trim();if(!name||name.length>40)throw new Error('La etiqueta debe tener entre 1 y 40 caracteres.');
      if(!/^#[0-9a-f]{6}$/i.test(tag.color))throw new Error('Color no válido.');
      const tx=db.transaction(['tags','settings'],'readwrite');
      await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));
      const tags=await tx.objectStore('tags').getAll();
      if(tags.some(t=>t.id!==tag.id&&t.name.toLocaleLowerCase()===name.toLocaleLowerCase())){await tx.done;throw new Error('Ya existe una etiqueta con ese nombre.');}
      await Promise.all([tx.objectStore('tags').put({...tag,name}),tx.done]);
    },
    async deleteTag(id:string){
      const tx=db.transaction(['tags','tasks','views','habits','settings'],'readwrite');const done=tx.done;void done.catch(()=>{});
      try{
        await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));
        await tx.objectStore('tags').delete(id);
        for(const t of await tx.objectStore('tasks').getAll())if(t.tagIds.includes(id))await tx.objectStore('tasks').put({...t,tagIds:t.tagIds.filter(x=>x!==id),revision:t.revision+1,updatedAt:new Date().toISOString()});
        for(const h of await tx.objectStore('habits').getAll())if(h.tagId===id)await tx.objectStore('habits').put({...h,tagId:null,revision:h.revision+1,updatedAt:new Date().toISOString()});
        // Keep the missing ID in saved filters: deleting a tag must not silently broaden a view.
        await done;
      }catch(e){try{tx.abort();}catch{}await done.catch(()=>{});throw e;}
    },
    async saveView(view:SavedView){const name=view.name.trim();if(!name||name.length>60)throw new Error('La vista debe tener entre 1 y 60 caracteres.');const tx=db.transaction(['views','settings'],'readwrite');await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));await Promise.all([tx.objectStore('views').put({...view,name}),tx.done]);},
    async deleteView(id:string){const tx=db.transaction(['views','settings'],'readwrite');await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));await Promise.all([tx.objectStore('views').delete(id),tx.done]);},
    async focus(date:string){return (await db.get('focus',date))?.taskIds??[];},
    async toggleFocus(date:string,id:string){
      const tx=db.transaction(['focus','tasks','settings'],'readwrite');const done=tx.done;void done.catch(()=>{});
      try{
        await assertFreshDatabase(db,key=>tx.objectStore('settings').get(key));
        const all=await tx.objectStore('tasks').getAll();
        const current=((await tx.objectStore('focus').get(date))?.taskIds??[]).filter(id=>all.some(t=>t.id===id&&!t.completedAt&&!t.archivedAt&&!t.deletedAt));
        const ids=current.includes(id)?current.filter(x=>x!==id):[...current,id];
        if(ids.length>3)throw new Error('Elige hasta tres prioridades para hoy. Quita una antes de añadir otra.');
        await tx.objectStore('focus').put({date,taskIds:ids});await done;
      }catch(e){try{tx.abort();}catch{}await done.catch(()=>{});throw e;}
    },
  };
}
export type OrganizerRepository=ReturnType<typeof organizerRepository>;
