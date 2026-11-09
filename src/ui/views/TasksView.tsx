import React, { useState } from 'react';
import type { Task, Priority } from '../../domain/task';
import type { Tag } from '../../domain/views';
import { localDate } from '../../domain/task';
import { addDays } from '../../domain/habit';
import {
  Plus,
  Search,
  Star,
  Calendar,
  Tag as TagIcon,
  Trash2,
  Archive,
  Edit2,
  CheckCircle,
  Inbox,
} from 'lucide-react';
import { TaskModal } from '../components/TaskModal';

interface TasksViewProps {
  tasks: Task[];
  tags: Tag[];
  focusTaskIds: string[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onToggleFocus: (date: string, taskId: string) => Promise<void>;
  onAddTask: (data: any) => Promise<void>;
  onEditTask: (id: string, data: any, revision: number) => Promise<void>;
  onSetStatus: (id: string, status: 'archive' | 'trash' | 'restore' | 'unarchive') => Promise<void>;
}

type TabType = 'todas' | 'hoy' | 'proximas' | 'sin-fecha' | 'completadas';

export function TasksView({
  tasks,
  tags,
  focusTaskIds,
  onToggleTask,
  onToggleFocus,
  onAddTask,
  onEditTask,
  onSetStatus,
}: TasksViewProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const today = localDate();
  const nextWeek = addDays(today, 7);

  // Filtrar según pestaña
  const filteredTasks = tasks.filter((t) => {
    if (t.deletedAt) return false;

    // Filtro por búsqueda
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    // Filtro por etiqueta
    if (selectedTagId && !t.tagIds.includes(selectedTagId)) {
      return false;
    }

    // Pestañas
    if (currentTab === 'completadas') {
      return !!t.completedAt && !t.archivedAt;
    }

    if (t.completedAt || t.archivedAt) return false;

    if (currentTab === 'todas') {
      return true;
    }
    if (currentTab === 'hoy') {
      return t.plannedDate === today || t.dueDate === today;
    }
    if (currentTab === 'proximas') {
      const date = t.plannedDate || t.dueDate;
      return date && date > today && date <= nextWeek;
    }
    if (currentTab === 'sin-fecha') {
      return !t.plannedDate && !t.dueDate;
    }

    return true;
  });

  const getPriorityBadge = (p: Priority) => {
    if (p === 'high') return <span className="task-badge priority-high">Alta</span>;
    if (p === 'medium') return <span className="task-badge priority-medium">Media</span>;
    if (p === 'low') return <span className="task-badge priority-low">Baja</span>;
    return null;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Tareas</h1>
            <p className="page-description">Organiza tus actividades con claridad y orden.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nueva tarea
          </button>
        </div>
      </header>

      {/* BARRA DE PESTAÑAS Y BÚSQUEDA */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'hoy', label: 'Hoy' },
            { id: 'proximas', label: 'Próximas (7d)' },
            { id: 'sin-fecha', label: 'Sin fecha' },
            { id: 'completadas', label: 'Completadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn ${currentTab === tab.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setCurrentTab(tab.id as TabType)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className={`task-badge`}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedTagId === null ? 'var(--primary-light)' : 'transparent',
                  color: selectedTagId === null ? 'var(--primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
                onClick={() => setSelectedTagId(null)}
              >
                Todas las etiquetas
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className="task-badge"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedTagId === tag.id ? tag.color : 'transparent',
                    color: selectedTagId === tag.id ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${selectedTagId === tag.id ? tag.color : 'var(--border)'}`,
                  }}
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE TAREAS */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
            <Inbox size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No hay tareas aquí</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {currentTab === 'completadas'
                ? 'Las tareas completadas aparecerán aquí.'
                : 'Crea una tarea nueva para comenzar.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isFocus = focusTaskIds.includes(task.id);
            const taskTags = tags.filter((t) => task.tagIds.includes(t.id));

            return (
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {task.notes}
                    </div>
                  )}
                  <div className="task-meta">
                    {getPriorityBadge(task.priority)}
                    {task.plannedDate && (
                      <span className="task-badge" style={{ background: 'var(--bg-surface-hover)' }}>
                        <Calendar size={11} /> {task.plannedDate}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="task-badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        Límite: {task.dueDate}
                      </span>
                    )}
                    {taskTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="task-badge"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {!task.completedAt && (
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      title={isFocus ? 'Quitar de prioridades de hoy' : 'Marcar como prioridad de hoy'}
                      onClick={() => onToggleFocus(today, task.id)}
                    >
                      <Star
                        size={14}
                        color={isFocus ? 'var(--warning)' : 'var(--text-muted)'}
                        fill={isFocus ? 'var(--warning)' : 'none'}
                      />
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-icon btn-sm"
                    title="Editar tarea"
                    onClick={() => setEditingTask(task)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-secondary btn-icon btn-sm"
                    title="Enviar a papelera"
                    onClick={() => onSetStatus(task.id, 'trash')}
                  >
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <TaskModal
          tags={tags}
          onSave={onAddTask}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          tags={tags}
          onSave={(draft) => onEditTask(editingTask.id, draft, editingTask.revision)}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
