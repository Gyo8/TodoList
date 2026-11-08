import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { createTask, localDate, type Priority, type Task } from '../domain/task';
import { openDatabase } from '../data/database';
import { taskRepository, type TaskRepository } from '../data/taskRepository';

type Page = 'Hoy' | 'Tareas' | 'Hábitos' | 'Ajustes';
const priorities: Record<Priority,string>={none:'Sin prioridad',low:'Baja',medium:'Media',high:'Alta'};
export function App() {
  const [page,setPage]=useState<Page>('Hoy');
  const [tasks,setTasks]=useState<Task[]>([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false);
  const [error,setError]=useState(''),[message,setMessage]=useState(''),[online,setOnline]=useState(navigator.onLine);
  const [title,setTitle]=useState(''),[priority,setPriority]=useState<Priority>('none'),[planned,setPlanned]=useState(localDate());
  const [filter,setFilter]=useState('Pendientes');
  const [cached,setCached]=useState(false);
  const repo=useRef<TaskRepository|null>(null),lock=useRef(false),input=useRef<HTMLInputElement>(null);
  const {offlineReady:[offlineReady],needRefresh:[needRefresh],updateServiceWorker}=useRegisterSW({onRegisterError(){setError('No se pudo preparar el uso sin conexión. Tus datos locales no se borraron.');}});
  useEffect(()=>{
    let active=true; let close:(()=>void)|undefined;
    if(import.meta.env.PROD && 'serviceWorker' in navigator) void navigator.serviceWorker.ready.then(()=>{if(active)setCached(true);});
    openDatabase().then(async db=>{if(!active){db.close();return;}close=()=>db.close();const r=taskRepository(db);const list=await r.list();if(active){repo.current=r;setTasks(list);setReady(true);}}).catch(()=>{if(active)setError('No se pudo abrir el almacenamiento. Revisa los permisos del navegador y vuelve a cargar.');});
    const connection=()=>setOnline(navigator.onLine);
    const blocked=()=>{setReady(false);setError('Cierra las otras pestañas de Ritmo y recarga para actualizar el almacenamiento.');};
    const refresh=()=>{if(repo.current)repo.current.list().then(list=>{if(active)setTasks(list);}).catch(()=>{if(active)setError('No se pudo actualizar la lista. Recarga para volver a intentarlo.');});};
    window.addEventListener('online',connection);window.addEventListener('offline',connection);window.addEventListener('focus',refresh);window.addEventListener('ritmo:database-blocked',blocked);
    return()=>{active=false;repo.current=null;close?.();window.removeEventListener('online',connection);window.removeEventListener('offline',connection);window.removeEventListener('focus',refresh);window.removeEventListener('ritmo:database-blocked',blocked);};
  },[]);
  async function mutate(action:(r:TaskRepository)=>Promise<void>,success:string):Promise<boolean>{
    if(!repo.current||lock.current)return false;
    lock.current=true;setBusy(true);setError('');setMessage('');
    try{await action(repo.current);setTasks(await repo.current.list());setMessage(success);return true;}
    catch{setError('No se pudo confirmar el guardado. Conservamos lo que escribiste; revisa la lista al recargar antes de reintentar.');return false;}
    finally{lock.current=false;setBusy(false);}
  }
  async function add(e:FormEvent){e.preventDefault();let task:Task;try{task=createTask(title,priority,planned||null);}catch(e){setError((e as Error).message);return;}if(await mutate(r=>r.add(task),'Tarea guardada en este dispositivo.')){setTitle('');setPriority('none');input.current?.focus();}}
  const activeTasks=tasks.filter(t=>!t.deletedAt&&!t.archivedAt);
  const shown=activeTasks.filter(t=>page==='Hoy'?(!t.completedAt&&t.plannedDate===localDate()):(filter==='Todas'||filter==='Completadas'?filter==='Todas'||!!t.completedAt:!t.completedAt));
  const list=<div className="task-list">{!ready?<p className="empty">{error?'Almacenamiento no disponible.':'Abriendo tus tareas…'}</p>:shown.length?shown.map(t=><label className="task" key={t.id}><input type="checkbox" checked={!!t.completedAt} disabled={busy} onChange={e=>{void mutate(r=>r.setCompleted(t.id,e.target.checked),e.target.checked?'Tarea completada. Puedes desmarcarla para deshacer.':'Tarea pendiente de nuevo.');}}/><span><span className={t.completedAt?'completed':''}>{t.title}</span><small>{t.plannedDate?`Planeada: ${t.plannedDate===localDate()?'Hoy':t.plannedDate}`:'Sin fecha'}</small></span><span className={`priority ${t.priority}`}>{priorities[t.priority]}</span></label>):<div className="empty"><h3>{page==='Hoy'?'Un día con espacio.':'Tu lista empieza aquí.'}</h3><p>{page==='Hoy'?'Añade una tarea para hoy o consulta todas tus tareas.':'Las tareas que añadas se guardarán en este navegador.'}</p></div>}</div>;
  return <div className="app"><aside><a className="brand" href="#" onClick={e=>{e.preventDefault();setPage('Hoy');}}>ritmo<span>.</span></a><p className="tagline">Un día a la vez</p><nav aria-label="Principal">{(['Hoy','Tareas','Hábitos','Ajustes'] as Page[]).map((p,i)=><button key={p} aria-current={page===p?'page':undefined} onClick={()=>setPage(p)}><span aria-hidden="true">{['☀','☑','✿','⚙'][i]}</span>{p}</button>)}</nav><div className="sidebar-note"><span className="dot"/> Personal · Local<br/><small>Primera versión en construcción</small></div></aside><main><header><div className="eyebrow">{new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</div><h1>{page==='Hoy'?'Haz espacio para lo importante.':page==='Tareas'?'Una cosa a la vez.':page==='Hábitos'?'La constancia se construye.':'A tu manera.'}</h1><p className="subtitle">{page==='Hoy'?'Elige un pequeño paso para comenzar.':page==='Tareas'?'Menos en la cabeza. Más claridad para tu día.':page==='Hábitos'?'El seguimiento de hábitos será la siguiente etapa.':'Tus datos permanecen en este navegador.'}</p></header>
  <div className="connection"><span className="dot"/>{online?'Con conexión':'Sin conexión'}<span>·</span>{offlineReady||cached?'Lista para usar sin conexión':import.meta.env.DEV?'Vista de desarrollo':'Preparando acceso sin conexión…'}</div>
  {needRefresh&&<div className="notice">Hay una versión nueva. Guarda cualquier tarea antes de actualizar. <button disabled={busy||!!title.trim()} onClick={()=>void updateServiceWorker(true)}>Actualizar</button></div>}
  {error&&<div className="error" role="alert">{error}</div>}<p className="status" role="status">{busy?'Guardando…':message}</p>
  {(page==='Hoy'||page==='Tareas')&&<><section className="capture"><h2>¿Qué necesitas hacer?</h2><form onSubmit={add}><label className="title-field">Tarea<input ref={input} value={title} onChange={e=>setTitle(e.target.value)} required maxLength={200} placeholder="Ej. Estudiar para el examen" disabled={!ready||busy}/></label><div className="form-options"><label>Prioridad<select value={priority} onChange={e=>setPriority(e.target.value as Priority)} disabled={busy}><option value="none">Sin prioridad</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></label><label>Fecha planeada<input type="date" value={planned} onChange={e=>setPlanned(e.target.value)} disabled={busy}/></label><button className="primary" disabled={!ready||busy||!title.trim()}>+ Añadir tarea</button></div></form></section><div className="section-heading"><h2>{page==='Hoy'?'Tus tareas de hoy':'Tu lista'}</h2>{page==='Hoy'?<button className="text-button" onClick={()=>setPage('Tareas')}>Ver todas →</button>:<span className="count">{shown.length} tareas</span>}</div>{page==='Tareas'&&<div className="filters">{['Pendientes','Todas','Completadas'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>}{list}{page==='Hoy'&&<section className="habit-preview"><span className="flower" aria-hidden="true">✿</span><div><h2>Pequeños pasos, grandes hábitos.</h2><p>Próximamente: días específicos y metas semanales, a tu ritmo.</p></div></section>}</>}
  {page==='Hábitos'&&<section className="habit-preview"><span className="flower" aria-hidden="true">✿</span><div><h2>Próximamente</h2><p>Primero estamos comprobando que tus datos se guarden correctamente. Aquí podrás registrar hábitos sin penalizar los días que no te corresponden.</p><span className="badge">Planeado · Todavía no disponible</span></div></section>}
  {page==='Ajustes'&&<section className="settings"><article><h2>Guardado local</h2><p>{ready?'Almacenamiento disponible.':'Almacenamiento no disponible.'} Las tareas se guardan después de cada cambio confirmado.</p></article><article><h2>Cuida tus datos</h2><p>Borrar los datos del navegador puede eliminar tus tareas. La exportación y restauración de respaldos todavía están pendientes; usa esta versión para pruebas.</p></article><article><h2>Un dispositivo a la vez</h2><p>No hay cuenta, sincronización, IA externa ni envío de tus tareas a un servidor.</p></article><article><h2>Versión 0.1 · Base técnica</h2><p>Crear y completar tareas ya está disponible. Edición, etiquetas, vistas guardadas y hábitos se construirán después.</p></article></section>}
  <footer>Guardado en este dispositivo · Sin sincronización</footer></main></div>;
}
