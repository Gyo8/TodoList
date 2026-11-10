import React, { useState, useEffect } from 'react';
import {
  Sun,
  CheckSquare,
  Flame,
  Clock,
  ShoppingCart,
  Settings,
  Moon,
  SunMedium,
  Menu,
  X,
} from 'lucide-react';
import { SyncBadge } from './SyncBadge';

export type Page = 'Hoy' | 'Tareas' | 'Hábitos' | 'Rutinas' | 'Despensa & Pagos' | 'Ajustes';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  theme: string;
  onToggleTheme: () => void;
}

export function Navbar({ currentPage, onPageChange, theme, onToggleTheme }: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: Array<{ id: Page; label: string; icon: React.ReactNode; desc?: string }> = [
    { id: 'Hoy', label: 'Hoy', icon: <Sun size={19} />, desc: 'Dashboard del día' },
    { id: 'Tareas', label: 'Tareas', icon: <CheckSquare size={19} />, desc: 'Gestor y prioridades' },
    { id: 'Hábitos', label: 'Hábitos', icon: <Flame size={19} />, desc: 'Constancia y graduación' },
    { id: 'Rutinas', label: 'Rutinas', icon: <Clock size={19} />, desc: 'Time-blocking guiado' },
    {
      id: 'Despensa & Pagos',
      label: 'Despensa & Pagos',
      icon: <ShoppingCart size={19} />,
      desc: 'Mandado y suscripciones',
    },
    { id: 'Ajustes', label: 'Ajustes', icon: <Settings size={19} />, desc: 'Nube, respaldo e IA' },
  ];

  // Cerrar drawer al cambiar de página
  const handleSelectPage = (page: Page) => {
    onPageChange(page);
    setDrawerOpen(false);
  };

  // Prevenir scroll en body cuando el drawer esté abierto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. BARRA SUPERIOR PARA MÓVIL (HEADER CON BOTÓN HAMBURGUESA) */}
      {/* ============================================================ */}
      <header className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={22} />
        </button>

        <div className="mobile-brand" onClick={() => handleSelectPage('Hoy')}>
          <div className="brand-logo-small">R</div>
          <span className="brand-name-small">
            Ritmo<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="mobile-header-actions">
          <SyncBadge />
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* OVERLAY / BACKDROP PARA MÓVIL */}
      <div
        className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* DRAWER LATERAL DESPLEGABLE PARA MÓVIL */}
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Menú principal">
        <div className="drawer-header">
          <div className="brand-section" style={{ marginBottom: 0, paddingLeft: 0 }}>
            <div className="brand-logo">R</div>
            <div>
              <div className="brand-name">
                Ritmo<span className="brand-dot">.</span>
              </div>
              <div className="brand-subtitle">Un día a la vez</div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                className={`drawer-link ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectPage(item.id)}
              >
                <div className="drawer-link-icon">{item.icon}</div>
                <div className="drawer-link-text">
                  <div className="drawer-link-label">{item.label}</div>
                  <div className="drawer-link-desc">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="drawer-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SyncBadge />
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ritmo v2.0 · Multiplataforma
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. SIDEBAR FIJO PARA ESCRITORIO (PC) */}
      {/* ============================================================ */}
      <aside className="desktop-sidebar">
        <div className="brand-section">
          <div className="brand-logo">R</div>
          <div>
            <div className="brand-name">
              Ritmo<span className="brand-dot">.</span>
            </div>
            <div className="brand-subtitle">Un día a la vez</div>
          </div>
        </div>

        <nav className="nav-group">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SyncBadge />
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ritmo v2.0 · Multiplataforma
          </div>
        </div>
      </aside>
    </>
  );
}
