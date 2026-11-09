import {
  initFirebase,
  getStoredFirebaseConfig,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  onAuthStateChanged,
  type User,
} from './firebase';
import { getDatabase } from '../data/database';
import type { Task } from '../domain/task';
import type { Habit } from '../domain/habit';
import type { Tag, SavedView } from '../domain/views';

export type SyncStatus = 'local-only' | 'offline' | 'syncing' | 'synced' | 'error';

class SyncManager {
  private status: SyncStatus = 'local-only';
  private currentUser: User | null = null;
  private listeners: Array<(status: SyncStatus, user: User | null) => void> = [];
  private unsubscribeFirestore: Array<() => void> = [];
  private initialized = false;

  public subscribe(cb: (status: SyncStatus, user: User | null) => void) {
    this.listeners.push(cb);
    cb(this.status, this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    for (const cb of this.listeners) {
      cb(this.status, this.currentUser);
    }
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Detectar conectividad de red
    window.addEventListener('online', () => this.handleNetworkChange());
    window.addEventListener('offline', () => this.handleNetworkChange());

    const config = getStoredFirebaseConfig();
    if (!config) {
      this.status = 'local-only';
      this.notify();
      return;
    }

    const { auth } = initFirebase();
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        if (user) {
          this.status = navigator.onLine ? 'synced' : 'offline';
          this.setupRealtimeListeners(user.uid);
          // Subir datos locales a la nube si es la primera vez
          this.initialCloudSync(user.uid).catch(console.error);
        } else {
          this.cleanupFirestoreListeners();
          this.status = 'local-only';
        }
        this.notify();
      });
    }
  }

  private handleNetworkChange() {
    if (!this.currentUser) {
      this.status = 'local-only';
    } else {
      this.status = navigator.onLine ? 'synced' : 'offline';
    }
    this.notify();
  }

  private cleanupFirestoreListeners() {
    for (const unsub of this.unsubscribeFirestore) {
      unsub();
    }
    this.unsubscribeFirestore = [];
  }

  /**
   * Escucha cambios en tiempo real desde Firestore (por ejemplo, desde otro dispositivo)
   * y actualiza la base local IndexedDB.
   */
  private setupRealtimeListeners(userId: string) {
    this.cleanupFirestoreListeners();
    const { db } = initFirebase();
    if (!db) return;

    try {
      // 1. Tareas
      const tasksCol = collection(db, 'users', userId, 'tasks');
      const unsubTasks = onSnapshot(tasksCol, async (snapshot) => {
        const localDb = await getDatabase();
        const tx = localDb.transaction('tasks', 'readwrite');
        for (const change of snapshot.docChanges()) {
          const task = change.doc.data() as Task;
          if (change.type === 'added' || change.type === 'modified') {
            const existing = await tx.objectStore('tasks').get(task.id);
            if (!existing || new Date(task.updatedAt) > new Date(existing.updatedAt)) {
              await tx.objectStore('tasks').put(task);
            }
          } else if (change.type === 'removed') {
            await tx.objectStore('tasks').delete(task.id);
          }
        }
        await tx.done;
        window.dispatchEvent(new CustomEvent('ritmo:data-changed'));
      });
      this.unsubscribeFirestore.push(unsubTasks);

      // 2. Hábitos
      const habitsCol = collection(db, 'users', userId, 'habits');
      const unsubHabits = onSnapshot(habitsCol, async (snapshot) => {
        const localDb = await getDatabase();
        const tx = localDb.transaction('habits', 'readwrite');
        for (const change of snapshot.docChanges()) {
          const habit = change.doc.data() as Habit;
          if (change.type === 'added' || change.type === 'modified') {
            const existing = await tx.objectStore('habits').get(habit.id);
            if (!existing || new Date(habit.updatedAt) > new Date(existing.updatedAt)) {
              await tx.objectStore('habits').put(habit);
            }
          } else if (change.type === 'removed') {
            await tx.objectStore('habits').delete(habit.id);
          }
        }
        await tx.done;
        window.dispatchEvent(new CustomEvent('ritmo:data-changed'));
      });
      this.unsubscribeFirestore.push(unsubHabits);

      // 3. Etiquetas
      const tagsCol = collection(db, 'users', userId, 'tags');
      const unsubTags = onSnapshot(tagsCol, async (snapshot) => {
        const localDb = await getDatabase();
        const tx = localDb.transaction('tags', 'readwrite');
        for (const change of snapshot.docChanges()) {
          const tag = change.doc.data() as Tag;
          if (change.type === 'added' || change.type === 'modified') {
            await tx.objectStore('tags').put(tag);
          } else if (change.type === 'removed') {
            await tx.objectStore('tags').delete(tag.id);
          }
        }
        await tx.done;
        window.dispatchEvent(new CustomEvent('ritmo:data-changed'));
      });
      this.unsubscribeFirestore.push(unsubTags);
    } catch (err) {
      console.error('Error configurando listeners de Firestore:', err);
      this.status = 'error';
      this.notify();
    }
  }

  /**
   * Sube una tarea a Firestore en segundo plano
   */
  public async pushTask(task: Task) {
    if (!this.currentUser) return;
    const { db } = initFirebase();
    if (!db) return;

    try {
      const taskRef = doc(db, 'users', this.currentUser.uid, 'tasks', task.id);
      await setDoc(taskRef, task, { merge: true });
    } catch (e) {
      console.warn('Escritura local en cola de Firestore (offline):', e);
    }
  }

  /**
   * Sube un hábito a Firestore en segundo plano
   */
  public async pushHabit(habit: Habit) {
    if (!this.currentUser) return;
    const { db } = initFirebase();
    if (!db) return;

    try {
      const habitRef = doc(db, 'users', this.currentUser.uid, 'habits', habit.id);
      await setDoc(habitRef, habit, { merge: true });
    } catch (e) {
      console.warn('Escritura local en cola de Firestore (offline):', e);
    }
  }

  /**
   * Sube una etiqueta a Firestore
   */
  public async pushTag(tag: Tag) {
    if (!this.currentUser) return;
    const { db } = initFirebase();
    if (!db) return;

    try {
      const tagRef = doc(db, 'users', this.currentUser.uid, 'tags', tag.id);
      await setDoc(tagRef, tag, { merge: true });
    } catch (e) {
      console.warn('Escritura local en cola de Firestore (offline):', e);
    }
  }

  /**
   * Elimina una etiqueta de Firestore
   */
  public async removeTag(id: string) {
    if (!this.currentUser) return;
    const { db } = initFirebase();
    if (!db) return;

    try {
      const tagRef = doc(db, 'users', this.currentUser.uid, 'tags', id);
      await deleteDoc(tagRef);
    } catch (e) {
      console.warn('Eliminación en cola de Firestore (offline):', e);
    }
  }

  /**
   * Sincronización inicial bidireccional al iniciar sesión
   */
  public async initialCloudSync(userId: string) {
    const { db } = initFirebase();
    if (!db) return;

    this.status = 'syncing';
    this.notify();

    try {
      const localDb = await getDatabase();

      // Subir tareas locales existentes a Firestore
      const localTasks = await localDb.getAll('tasks');
      for (const t of localTasks) {
        await setDoc(doc(db, 'users', userId, 'tasks', t.id), t, { merge: true });
      }

      // Subir hábitos locales existentes
      const localHabits = await localDb.getAll('habits');
      for (const h of localHabits) {
        await setDoc(doc(db, 'users', userId, 'habits', h.id), h, { merge: true });
      }

      // Subir etiquetas locales
      const localTags = await localDb.getAll('tags');
      for (const tag of localTags) {
        await setDoc(doc(db, 'users', userId, 'tags', tag.id), tag, { merge: true });
      }

      this.status = 'synced';
    } catch (err) {
      console.error('Error en sincronización inicial:', err);
      this.status = navigator.onLine ? 'synced' : 'offline';
    }
    this.notify();
  }
}

export const syncManager = new SyncManager();

