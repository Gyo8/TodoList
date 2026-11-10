import React, { useState } from 'react';
import { Clock, Calendar, Plus, Sparkles, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export function RoutinesView() {
  const [activeTab, setActiveTab] = useState<'semana' | 'dia'>('semana');

  // Categorías de rutina con sus colores distintivos
  const categories = [
    { id: 'estudio', label: 'Estudio / Aprendizaje', color: '#3b82f6' },
    { id: 'trabajo', label: 'Trabajo / Proyectos', color: '#10b981' },
    { id: 'salud', label: 'Salud / Deporte', color: '#f59e0b' },
    { id: 'personal', label: 'Personal / Rutina', color: '#8b5cf6' },
    { id: 'descanso', label: 'Descanso / Social', color: '#ec4899' },
  ];

  // Bloques de ejemplo que ilustran el concepto de time-blocking
  const sampleBlocks = [
    {
      id: '1',
      title: 'Rutina matutina y desayuno',
      category: 'personal',
      startTime: '07:00',
      endTime: '08:00',
      color: '#8b5cf6',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    },
    {
      id: '2',
      title: 'Bloque de estudio profundo / Examen',
      category: 'estudio',
      startTime: '08:30',
      endTime: '11:00',
      color: '#3b82f6',
      days: ['Lun', 'Mié', 'Vie'],
      isPriority: true,
    },
    {
      id: '3',
      title: 'Proyectos y tareas técnicas',
      category: 'trabajo',
      startTime: '11:30',
      endTime: '14:00',
      color: '#10b981',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    },
    {
      id: '4',
      title: 'Calistenia / Ejercicio',
      category: 'salud',
      startTime: '18:00',
      endTime: '19:30',
      color: '#f59e0b',
      days: ['Lun', 'Mar', 'Jue', 'Sáb'],
      isPriority: true,
    },
    {
      id: '5',
      title: 'Desconexión y lectura',
      category: 'descanso',
      startTime: '21:30',
      endTime: '22:30',
      color: '#ec4899',
      days: ['Todos los días'],
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="page-eyebrow">
              <Compass size={15} />
              Orientación sin agobio
            </div>
            <h1 className="page-title">Rutinas & Time-Blocking</h1>
            <p className="page-description">
              Tu mapa de orientación diaria. Sin casillas de verificación ni culpa: una guía de qué hacer si andas perdido o procrastinando.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => alert('En la Fase 2 activaremos el creador interactivo de bloques horarios.')}>
            <Plus size={16} /> Nuevo bloque horario
          </button>
        </div>
      </header>

      {/* TABS DE VISTA */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          className={`btn ${activeTab === 'semana' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('semana')}
        >
          <Calendar size={15} /> Semana completa
        </button>
        <button
          className={`btn ${activeTab === 'dia' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('dia')}
        >
          <Clock size={15} /> Horario del día
        </button>
      </div>

      {/* BANNER INFORMATIVO DEL CONCEPTO */}
      <div
        className="card"
        style={{
          background: 'var(--primary-light)',
          borderColor: 'var(--primary)',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <Sparkles size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            ¿En qué se diferencian las Rutinas del Habit Tracker?
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Los <strong>Hábitos</strong> llevan casillas para registrar si cumpliste hoy. En cambio, las <strong>Rutinas</strong> son una guía horaria de acompañamiento: te indican de qué hora a qué hora dedicarte a cada actividad para no divagar. Si un día no pudiste seguirla al pie de la letra, no baja ningún porcentaje.
          </div>
        </div>
      </div>

      {/* LEYENDA DE CATEGORÍAS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {categories.map((c) => (
          <span
            key={c.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: `${c.color}15`,
              color: c.color,
              border: `1px solid ${c.color}35`,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      {/* LISTA DE BLOQUES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sampleBlocks.map((block) => (
          <div
            key={block.id}
            className="card"
            style={{
              borderLeft: `5px solid ${block.color}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Clock size={14} color={block.color} />
                {block.startTime} – {block.endTime}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {block.title}
                  {block.isPriority && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--warning-light)',
                        color: 'var(--warning)',
                        fontWeight: 700,
                      }}
                    >
                      Prioritario
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Días: {block.days.join(', ')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`En la Fase 2 podrás editar el horario del bloque: ${block.title}`)}
              >
                Ajustar horario
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

