import React, { useState } from 'react';
import type { Task } from '../../domain/task';
import type { Habit } from '../../domain/habit';
import type { Tag } from '../../domain/views';
import { eligible, todayIn } from '../../domain/habit';
import { localDate } from '../../domain/task';
import { Plus, Star, CheckCircle2, Circle, AlertTriangle, Calendar, Flame, Clock, ArrowRight } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { HabitModal } from '../components/HabitModal';

interface TodayViewProps {
  tasks: Task[];
  habits: Habit[];
  tags: Tag[];
  focusTaskIds: string[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onToggleFocus: (date: string, taskId: string) => Promise<void>;
  onRecordHabit: (habitId: string, date: string, done: boolean) => Promise<void>;
  onAddTask: (data: any) => Promise<void>;
  onAddHabit: (data: any) => Promise<void>;
  onNavigate?: (page: any) => void;
}

export function TodayView({
  tasks,
  habits,
  tags,
  focusTaskIds,
  onToggleTask,
  onToggleFocus,
  onRecordHabit,
  onAddTask,
  onAddHabit,
  onNavigate,
}: TodayViewProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const today = localDate();

  // Fecha legible
  const dateFormatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // 1. Tareas de Enfoque Diario (máximo 3)
  const focusTasks = tasks.filter((t) => focusTaskIds.includes(t.id) && !t.deletedAt && !t.archivedAt);

  // 2. Tareas programadas para hoy
  const todayTasks = tasks.filter(
    (t) =>
      !t.deletedAt &&
      !t.archivedAt &&
      t.plannedDate === today &&
      !focusTaskIds.includes(t.id)
  );

  // 3. Tareas vencidas (fecha límite < hoy y no completadas)
  const overdueTasks = tasks.filter(
    (t) =>
      !t.deletedAt &&
      !t.archivedAt &&
      !t.completedAt &&
      t.dueDate &&
      t.dueDate < today
  );

  // 4. Hábitos activos para hoy
  const todayHabits = habits.filter(
    (h) => !h.deletedAt && !h.archived&& eligible(h, today)
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-eyebrow">
          <Calendar size={15} />
          {dateFormatted}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Tu Ritmo de Hoy</h1>
            <p className="page-description">Enfócate en lo esencial. Un día a la vez.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowHabitModal(true)}>
              <Flame size={15} /> + Hábito
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> + Tarea
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN COMPACTA: RUTINA EN CURSO */}
      <section style={{ marginBottom: '1.75rem' }}>
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.85rem 1.15rem',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'grid',
                placeContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Rutina en curso
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Tu mapa del día está listo para orientarte
              </div>
            </div>
          </div>

          {onNavigate && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('Rutinas')}
              style={{ fontSize: '0.8rem' }}
            >
              Ver rutinas <ArrowRight size={14} />
            </button>
          )}
        </div>
      </section>

      {/* SECCIÓN 1: PRIORIDADES DEL DÍA (MÁXIMO 3) */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 className="card-title">
            <Star size={18} color="var(--warning)" fill="var(--warning)" />
            Prioridades del día ({focusTasks.filter((t) => t.completedAt).length}/{focusTasks.length})
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Hasta 3 tareas clave
          </span>
        </div>

        {focusTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', borderStyle: 'dashed' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
              No has seleccionado ninguna prioridad para hoy.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Elige hasta 3 tareas desde tu lista de tareas haciendo clic en la estrella.
            </p>
          </div>
        ) : (
          <div>
            {focusTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completedAt ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={!!task.completedAt}
                  onChange={(e) => onToggleTask(task.id, e.target.checked)}
                />
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  {task.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {task.notes}
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-secondary btn-icon btn-sm"
                  title="Quitar de prioridades de hoy"
                  onClick={() => onToggleFocus(today, task.id)}
                >
                  <Star size={14} color="var(--warning)" fill="var(--warning)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: HÁBITOS DE HOY */}
      {todayHabits.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>
            <Flame size={18} color="var(--primary)" />
            Hábitos de hoy ({todayHabits.filter((h) => h.records.includes(today)).length}/{todayHabits.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {todayHabits.map((habit) => {
              const isDone = habit.records.includes(today);
              return (
                <div
                  key={habit.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.1rem',
                    borderLeft: `4px solid ${habit.color}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => onRecordHabit(habit.id, today, !isDone)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: `${habit.color}15`,
                        display: 'grid',
                        placeContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{habit.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {habit.mode === 'weekly' ? 'Meta semanal' : 'Día fijo'}
                      </div>
                    </div>
                  </div>
                  <div>
                    {isDone ? (
                      <CheckCircle2 size={24} color="var(--primary)" fill="var(--primary-light)" />
                    ) : (
                      <Circle size={24} color="var(--text-muted)" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECCIÓN 3: TAREAS VENCIDAS */}
      {overdueTasks.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 className="card-title" style={{ marginBottom: '0.75rem', color: 'var(--danger)' }}>
            <AlertTriangle size={18} />
            Atrasadas ({overdueTasks.length})
          </h2>
          {overdueTasks.map((task) => (
            <div key={task.id} className="task-item">
              <input
                type="checkbox"
                className="task-checkbox"
                checked={!!task.completedAt}
                onChange={(e) => onToggleTask(task.id, e.target.checked)}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="task-badge priority-high">Venció el {task.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* SECCIÓN 4: OTRAS TAREAS PLANEADAS PARA HOY */}
      {todayTasks.length > 0 && (
        <section>
          <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>
            Planeadas para hoy ({todayTasks.length})
          </h2>
          {todayTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completedAt ? 'completed' : ''}`}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={!!task.completedAt}
                onChange={(e) => onToggleTask(task.id, e.target.checked)}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
              </div>
              <button
                className="btn btn-secondary btn-icon btn-sm"
                title="Hacer prioridad de hoy"
                onClick={() => onToggleFocus(today, task.id)}
              >
                <Star size={14} color="var(--text-muted)" />
              </button>
            </div>
          ))}
        </section>
      )}

      {showTaskModal && (
        <TaskModal
          tags={tags}
          onSave={onAddTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showHabitModal && (
        <HabitModal
          onSave={onAddHabit}
          onClose={() => setShowHabitModal(false)}
        />
      )}
    </div>
  );
}

