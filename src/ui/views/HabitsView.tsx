import React, { useState } from 'react';
import type { Habit } from '../../domain/habit';
import {
  weekSummary,
  monthSummary,
  startOfWeek,
  addDays,
  dates,
  eligible,
  dateState,
} from '../../domain/habit';
import { localDate } from '../../domain/task';
import { Plus, Flame, Pause, Play, Archive, Trash2, Edit2, TrendingUp, Calendar } from 'lucide-react';
import { HabitModal } from '../components/HabitModal';

interface HabitsViewProps {
  habits: Habit[];
  onRecordHabit: (id: string, date: string, done: boolean) => Promise<void>;
  onAddHabit: (data: any) => Promise<void>;
  onEditHabit: (id: string, data: any, revision: number) => Promise<void>;
  onHabitStatus: (id: string, action: any) => Promise<void>;
}

const SHORT_WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function HabitsView({
  habits,
  onRecordHabit,
  onAddHabit,
  onEditHabit,
  onHabitStatus,
}: HabitsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = localDate();

  const activeHabits = habits.filter((h) => !h.deletedAt && !h.archived);

  // Obtener los 7 días de la semana actual (empezando lunes)
  const currentWeekStart = startOfWeek(today, 1);
  const currentWeekDays = dates(currentWeekStart, addDays(currentWeekStart, 6));

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Hábitos</h1>
            <p className="page-description">Pequeños pasos sostenibles. La constancia se construye.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nuevo hábito
          </button>
        </div>
      </header>

      {/* LISTA DE HÁBITOS */}
      <div>
        {activeHabits.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', borderStyle: 'dashed' }}>
            <Flame size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.05rem' }}>
              No tienes hábitos activos todavía
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', marginBottom: '1.25rem' }}>
              Crea tu primer hábito para empezar a registrar tu constancia diaria o semanal.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Crear mi primer hábito
            </button>
          </div>
        ) : (
          activeHabits.map((habit) => {
            const summary = weekSummary(habit, today);
            const isPaused = habit.breaks.some((b) => b.kind === 'pause' && !b.to);

            return (
              <div key={habit.id} className="habit-card">
                <div className="habit-header">
                  <div className="habit-identity">
                    <div
                      className="habit-icon-box"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        color: habit.color,
                        border: `1px solid ${habit.color}30`,
                      }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <div className="habit-name">{habit.name}</div>
                      <div className="habit-desc">
                        {habit.mode === 'weekly'
                          ? `Meta: ${habit.rules[habit.rules.length - 1].target} días por semana`
                          : 'Días fijos programados'}
                        {isPaused && (
                          <span
                            className="task-badge priority-medium"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            Pausado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      title={isPaused ? 'Reanudar hábito' : 'Pausar hábito'}
                      onClick={() => onHabitStatus(habit.id, isPaused ? 'resume' : 'pause')}
                    >
                      {isPaused ? <Play size={13} color="var(--primary)" /> : <Pause size={13} />}
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Editar hábito"
                      onClick={() => setEditingHabit(habit)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Archivar hábito"
                      onClick={() => onHabitStatus(habit.id, 'archive')}
                    >
                      <Archive size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Enviar a papelera"
                      onClick={() => onHabitStatus(habit.id, 'trash')}
                    >
                      <Trash2 size={13} color="var(--danger)" />
                    </button>
                  </div>
                </div>

                {habit.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {habit.description}
                  </p>
                )}

                {/* PROGRESO SEMANAL */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <TrendingUp size={14} color="var(--primary)" />
                    Esta semana:{' '}
                    <strong>
                      {summary.done}/{summary.goal} días
                    </strong>
                    {summary.extra > 0 && (
                      <span style={{ color: 'var(--primary)' }}> (+{summary.extra} extra)</span>
                    )}
                  </span>
                  <span>
                    {summary.percent !== null ? `${summary.percent}%` : 'En curso'}
                  </span>
                </div>

                {/* SELECTOR DE LOS 7 DÍAS DE LA SEMANA */}
                <div className="habit-week-grid">
                  {currentWeekDays.map((dateStr, idx) => {
                    const isDone = habit.records.includes(dateStr);
                    const isToday = dateStr === today;
                    const isEligible = eligible(habit, dateStr);
                    const isFuture = dateStr > today;
                    const dayNumber = new Date(dateStr + 'T12:00:00Z').getUTCDate();

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        className={`habit-day-btn ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}`}
                        disabled={isFuture}
                        onClick={() => onRecordHabit(habit.id, dateStr, !isDone)}
                        style={
                          isDone
                            ? { backgroundColor: habit.color, borderColor: habit.color }
                            : undefined
                        }
                      >
                        <span className="habit-day-name">{SHORT_WEEKDAYS[idx]}</span>
                        <span className="habit-day-num">{dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <HabitModal
          onSave={onAddHabit}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingHabit && (
        <HabitModal
          habit={editingHabit}
          onSave={(draft) => onEditHabit(editingHabit.id, draft, editingHabit.revision)}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  );
}

