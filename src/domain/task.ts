export type Priority = 'none' | 'low' | 'medium' | 'high';
export interface Task {
  id: string; title: string; priority: Priority; plannedDate: string | null;
  completedAt: string | null; createdAt: string; updatedAt: string;
  deletedAt: string | null; archivedAt: string | null; revision: number;
}
export function createTask(title: string, priority: Priority, plannedDate: string | null): Task {
  const clean = title.trim();
  if (!clean || clean.length > 200) throw new Error('Escribe un título de entre 1 y 200 caracteres.');
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: clean, priority, plannedDate, completedAt: null, createdAt: now, updatedAt: now, deletedAt: null, archivedAt: null, revision: 1 };
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
