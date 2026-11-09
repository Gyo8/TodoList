import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, type Page } from './components/Navbar';
import { TodayView } from './views/TodayView';
import { TasksView } from './views/TasksView';
import { HabitsView } from './views/HabitsView';
import { SettingsView } from './views/SettingsView';

import { getDatabase } from '../data/database';
import { taskRepository } from '../data/taskRepository';
import { habitRepository } from '../data/habitRepository';
import { organizerRepository } from '../data/organizerRepository';
import { loadPreferences, savePreferences } from '../data/preferences';
import { syncManager } from '../services/syncService';
import { localDate, createTask, type Task } from '../domain/task';
import type { Habit, HabitDraft } from '../domain/habit';
import type { Tag } from '../domain/views';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('Hoy');
  const [theme, setTheme] = useState<string>('system');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [focusTaskIds, setFocusTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const today = localDate();

  // Cargar datos desde la base de datos local
  const loadData = useCallback(async () => {
    try {
      const db = await getDatabase();
      const taskRepo = taskRepository(db);
      const habitRepo = habitRepository(db);
      const orgRepo = organizerRepository(db);
      const prefs = await loadPreferences();

      const [allTasks, allHabits, allTags, focusIds] = await Promise.all([
        taskRepo.list(),
        habitRepo.list(),
        orgRepo.tags(),
        orgRepo.focus(today),
      ]);

      setTasks(allTasks);
      setHabits(allHabits);
      setTags(allTags);
      setFocusTaskIds(focusIds);
      setTheme(prefs.theme);
      applyTheme(prefs.theme);
    } catch (err) {
      console.error('Error cargando datos locales:', err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  const applyTheme = (themeValue: string) => {
    const isDark =
      themeValue === 'dark' ||
      (themeValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  };

  useEffect(() => {
    // Inicializar sincronización en segundo plano
    syncManager.init().catch(console.error);

    // Carga inicial
    loadData();

    // Escuchar eventos de cambio de datos (desde Firestore u otra pestaña)
    const handleDataChanged = () => {
      loadData();
    };
    window.addEventListener('ritmo:data-changed', handleDataChanged);

    // Escuchar cambios de preferencia de sistema operativo
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    media.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('ritmo:data-changed', handleDataChanged);
      media.removeEventListener('change', handleMediaChange);
    };
  }, [loadData, theme]);

  // Manejar cambio de tema
  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    await savePreferences({ theme: newTheme as any });
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    handleThemeChange(next);
  };

  // Acciones de Tareas
  const handleToggleTask = async (id: string, completed: boolean) => {
    const db = await getDatabase();
    await taskRepository(db).setCompleted(id, completed);
    await loadData();
  };

  const handleToggleFocus = async (date: string, taskId: string) => {
    const db = await getDatabase();
    await organizerRepository(db).toggleFocus(date, taskId);
    await loadData();
  };

  const handleAddTask = async (data: any) => {
    const db = await getDatabase();
    const newTask = createTask(data.title, data.priority, data.plannedDate);
    newTask.notes = data.notes;
    newTask.dueDate = data.dueDate;
    newTask.tagIds = data.tagIds;
    await taskRepository(db).add(newTask);
    await loadData();
  };

  const handleEditTask = async (id: string, draft: any, revision: number) => {
    const db = await getDatabase();
    await taskRepository(db).edit(id, draft, revision);
    await loadData();
  };

  const handleSetTaskStatus = async (
    id: string,
    status: 'archive' | 'trash' | 'restore' | 'unarchive'
  ) => {
    const db = await getDatabase();
    await taskRepository(db).setStatus(id, status);
    await loadData();
  };

  // Acciones de Hábitos
  const handleRecordHabit = async (habitId: string, date: string, done: boolean) => {
    const db = await getDatabase();
    await habitRepository(db).record(habitId, date, done);
    await loadData();
  };

  const handleAddHabit = async (draft: HabitDraft) => {
    const db = await getDatabase();
    await habitRepository(db).add(draft);
    await loadData();
  };

  const handleEditHabit = async (id: string, draft: HabitDraft, revision: number) => {
    const db = await getDatabase();
    await habitRepository(db).edit(id, draft, revision);
    await loadData();
  };

  const handleHabitStatus = async (id: string, action: any) => {
    const db = await getDatabase();
    await habitRepository(db).status(id, action);
    await loadData();
  };

  // Acciones de Etiquetas
  const handleAddTag = async (name: string, color: string) => {
    const db = await getDatabase();
    await organizerRepository(db).saveTag({
      id: crypto.randomUUID(),
      name,
      color,
    });
    await loadData();
  };

  const handleDeleteTag = async (id: string) => {
    const db = await getDatabase();
    await organizerRepository(db).deleteTag(id);
    await loadData();
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeContent: 'center',
          height: '100vh',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}
      >
        Iniciando Ritmo…
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-wrapper">
        {currentPage === 'Hoy' && (
          <TodayView
            tasks={tasks}
            habits={habits}
            tags={tags}
            focusTaskIds={focusTaskIds}
            onToggleTask={handleToggleTask}
            onToggleFocus={handleToggleFocus}
            onRecordHabit={handleRecordHabit}
            onAddTask={handleAddTask}
            onAddHabit={handleAddHabit}
          />
        )}

        {currentPage === 'Tareas' && (
          <TasksView
            tasks={tasks}
            tags={tags}
            focusTaskIds={focusTaskIds}
            onToggleTask={handleToggleTask}
            onToggleFocus={handleToggleFocus}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onSetStatus={handleSetTaskStatus}
          />
        )}

        {currentPage === 'Hábitos' && (
          <HabitsView
            habits={habits}
            onRecordHabit={handleRecordHabit}
            onAddHabit={handleAddHabit}
            onEditHabit={handleEditHabit}
            onHabitStatus={handleHabitStatus}
          />
        )}

        {currentPage === 'Ajustes' && (
          <SettingsView
            tags={tags}
            theme={theme}
            onThemeChange={handleThemeChange}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
            onDataRestored={loadData}
          />
        )}
      </main>
    </div>
  );
}
