import React, { useState } from 'react';
import type { Habit, HabitDraft, HabitMode } from '../../domain/habit';
import { habitIcons } from '../../domain/habit';
import { localDate } from '../../domain/task';
import { X, Calendar, Sparkles, Check } from 'lucide-react';

interface HabitModalProps {
  habit?: Habit | null;
  onSave: (draft: HabitDraft) => Promise<void>;
  onClose: () => void;
}

const HABIT_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

const WEEKDAY_NAMES = [
  { day: 1, label: 'L' },
  { day: 2, label: 'M' },
  { day: 3, label: 'X' },
  { day: 4, label: 'J' },
  { day: 5, label: 'V' },
  { day: 6, label: 'S' },
  { day: 0, label: 'D' },
];

export function HabitModal({ habit, onSave, onClose }: HabitModalProps) {
  const defaultZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';

  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? '✿');
  const [color, setColor] = useState(habit?.color ?? '#10b981');
  const [mode, setMode] = useState<HabitMode>(habit?.mode ?? 'weekly');
  const [target, setTarget] = useState(habit ? habit.rules[habit.rules.length - 1].target : 4);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    habit ? habit.rules[habit.rules.length - 1].days : [1, 2, 3, 4, 5]
  );
  const [startDate] = useState(habit?.startDate ?? localDate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe un nombre para el hábito.');
      return;
    }
    if (mode === 'fixed' && selectedDays.length === 0) {
      setError('Selecciona al menos un día para el hábito.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        tagId: habit?.tagId ?? null,
        icon,
        color,
        mode,
        target: mode === 'weekly' ? target : selectedDays.length,
        days: mode === 'fixed' ? selectedDays : [0, 1, 2, 3, 4, 5, 6],
        startDate,
        weekStart: 1, // Lunes
        timeZone: defaultZone,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el hábito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{habit ? 'Editar hábito' : 'Nuevo hábito'}</h2>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del hábito</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Meditar 10 min, Leer, Tomar agua..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={120}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Icono</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {habitIcons.map((ic: string) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: `2px solid ${icon === ic ? 'var(--primary)' : 'var(--border)'}`,
                      background: icon === ic ? 'var(--primary-light)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      display: 'grid',
                      placeContent: 'center',
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {HABIT_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: `2px solid ${color === c ? 'var(--text-primary)' : 'transparent'}`,
                      backgroundColor: c,
                      cursor: 'pointer',
                      display: 'grid',
                      placeContent: 'center',
                    }}
                  >
                    {color === c && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!habit && (
            <div className="form-group">
              <label className="form-label">Frecuencia</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${mode === 'weekly' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => setMode('weekly')}
                >
                  Meta semanal flexible
                </button>
                <button
                  type="button"
                  className={`btn ${mode === 'fixed' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => setMode('fixed')}
                >
                  Días específicos
                </button>
              </div>

              {mode === 'weekly' ? (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Días por semana: <strong>{target} días</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '0.4rem' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {WEEKDAY_NAMES.map((d) => {
                    const isSelected = selectedDays.includes(d.day);
                    return (
                      <button
                        type="button"
                        key={d.day}
                        onClick={() => toggleDay(d.day)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.2rem',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? color : 'var(--border)'}`,
                          backgroundColor: isSelected ? color : 'var(--bg-primary)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Descripción o notas (opcional)</label>
            <textarea
              className="form-textarea"
              placeholder="¿Por qué es importante este hábito para ti?..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : habit ? 'Actualizar hábito' : 'Crear hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
