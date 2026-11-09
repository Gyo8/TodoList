import { openDatabase } from './database';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  weekStart: 0 | 1;
  timeZone: string;
}

let current: Preferences = {
  theme: 'system',
  weekStart: 1,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export const getPreferences = () => current;

export async function loadPreferences(): Promise<Preferences> {
  const db = await openDatabase();
  try {
    const settings = await db.getAll('settings');
    const find = (key: string) => settings.find((s) => s.key === key)?.value;
    current = {
      theme: (find('theme') as any) ?? 'system',
      weekStart: (find('weekStart') as 0 | 1) ?? 1,
      timeZone: (find('timeZone') as string) ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return current;
  } finally {
    db.close();
  }
}

export async function savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const db = await openDatabase();
  try {
    const tx = db.transaction('settings', 'readwrite');
    for (const [key, value] of Object.entries(patch)) {
      await tx.objectStore('settings').put({ key, value });
    }
    await tx.done;
    current = { ...current, ...patch };
    window.dispatchEvent(new CustomEvent('ritmo:preferences'));
    return current;
  } finally {
    db.close();
  }
}
