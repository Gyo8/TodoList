import React from 'react';
import { Sun, CheckSquare, Flame, Settings, Moon, SunMedium } from 'lucide-react';
import { SyncBadge } from './SyncBadge';

export type Page = 'Hoy' | 'Tareas' | 'Hábitos' | 'Ajustes';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  theme: string;
  onToggleTheme: () => void;
}

export function Navbar({ currentPage, onPageChange, theme, onToggleTheme }: NavbarProps) {
  const navItems: Array<{ id: Page; label: string; icon: React.ReactNode }> = [
    { id: 'Hoy', label: 'Hoy', icon: <Sun size={19} /> },
    { id: 'Tareas', label: 'Tareas', icon: <CheckSquare size={19} /> },
    { id: 'Hábitos', label: 'Hábitos', icon: <Flame size={19} /> },
    { id: 'Ajustes', label: 'Ajustes', icon: <Settings size={19} /> },
  ];

  return (
    <>
      {/* SIDEBAR PARA ESCRITORIO (PC) */}
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

      {/* BARRA INFERIOR PARA MÓVIL (ANDROID / SMARTPHONE) */}
      <nav className="mobile-bottom-bar">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

