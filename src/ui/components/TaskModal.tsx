import React, { useState } from 'react';
import type { Task, Priority } from '../../domain/task';
import type { Tag } from '../../domain/views';
import { X, Calendar, Flag, Tag as TagIcon, AlignLeft } from 'lucide-react';

interface TaskModalProps {
  task?: Task | null;
  tags: Tag[];
  onSave: (data: {
    title: string;
    priority: Priority;
    plannedDate: string | null;
    dueDate: string | null;
    notes: string;
    tagIds: string[];
  }) => Promise<void>;
  onClose: () => void;
}

export function TaskModal({ task, tags, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'none');
  const [plannedDate, setPlannedDate] = useState(task?.plannedDate ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(task?.tagIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor escribe un título para la tarea.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        priority,
        plannedDate: plannedDate || null,
        dueDate: dueDate || null,
        notes: notes.trim(),
        tagIds: selectedTagIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Editar tarea' : 'Nueva tarea'}</h2>
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
            <label className="form-label">¿Qué hay que hacer?</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Terminar informe, Comprar café..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={200}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flag size={14} /> Prioridad
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="none">Sin prioridad</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> Para el día
              </label>
              <input
                type="date"
                className="form-input"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> Fecha límite (opcional)
            </label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {tags.length > 0 && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TagIcon size={14} /> Etiquetas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className="task-badge"
                      style={{
                        backgroundColor: isSelected ? tag.color : 'var(--bg-surface-hover)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: `1px solid ${isSelected ? tag.color : 'var(--border)'}`,
                        cursor: 'pointer',
                        padding: '0.3rem 0.6rem',
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlignLeft size={14} /> Notas adicionales
            </label>
            <textarea
              className="form-textarea"
              placeholder="Detalles, enlaces o recordatorios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={5000}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : task ? 'Actualizar tarea' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

