export type Priority = 'none' | 'low' | 'medium' | 'high';
export interface Task {
  id: string; title: string; priority: Priority; plannedDate: string | null;
  completedAt: string | null; createdAt: string; updatedAt: string;
  deletedAt: string | null; archivedAt: string | null; revision: number;
  notes: string; dueDate: string | null; estimatedMinutes: number | null; tagIds: string[];
}
export type TaskDraft = Pick<Task, 'title'|'priority'|'plannedDate'|'notes'|'dueDate'|'estimatedMinutes'|'tagIds'>;
export function validateDraft(draft: TaskDraft): TaskDraft {
  const title=draft.title.trim();
  if(!title || title.length>200) throw new Error('Escribe un título de entre 1 y 200 caracteres.');
  if(draft.notes.length>5000) throw new Error('Las notas admiten hasta 5.000 caracteres.');
  if(!['none','low','medium','high'].includes(draft.priority)) throw new Error('Prioridad no válida.');
  for(const date of [draft.plannedDate,draft.dueDate]) if(date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date)) throw new Error('Fecha no válida.');
  if(draft.estimatedMinutes!==null && (!Number.isSafeInteger(draft.estimatedMinutes)||draft.estimatedMinutes<1)) throw new Error('La duración debe ser un número entero positivo.');
  return {...draft,title,tagIds:[...new Set(draft.tagIds)]};
}
export function createTask(title: string, priority: Priority, plannedDate: string | null): Task {
  const clean = title.trim();
  if (!clean || clean.length > 200) throw new Error('Escribe un título de entre 1 y 200 caracteres.');
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), ...validateDraft({title:clean,priority,plannedDate,notes:'',dueDate:null,estimatedMinutes:null,tagIds:[]}), completedAt: null, createdAt: now, updatedAt: now, deletedAt: null, archivedAt: null, revision: 1 };
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
