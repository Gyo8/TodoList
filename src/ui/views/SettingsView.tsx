import React, { useState, useEffect } from 'react';
import type { Tag } from '../../domain/views';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  initFirebase,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type FirebaseConfig,
  type User,
} from '../../services/firebase';
import { syncManager, type SyncStatus } from '../../services/syncService';
import { getDatabase } from '../../data/database';
import { exportBackup, parseBackup, restoreBackup, backupSummary } from '../../data/backup';
import {
  Cloud,
  HardDrive,
  Moon,
  Sun,
  Laptop,
  Download,
  Upload,
  Tag as TagIcon,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Key,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface SettingsViewProps {
  tags: Tag[];
  theme: string;
  onThemeChange: (theme: string) => Promise<void>;
  onAddTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onDataRestored: () => void;
}

const TAG_PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];

export function SettingsView({
  tags,
  theme,
  onThemeChange,
  onAddTag,
  onDeleteTag,
  onDataRestored,
}: SettingsViewProps) {
  // Sync & Firebase state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [currentUser, setCurrentUser] = useState<User | null>(syncManager.getUser());
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig | null>(getStoredFirebaseConfig());
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configJson, setConfigJson] = useState('');

  // Auth inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tag inputs
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10b981');
  const [tagError, setTagError] = useState('');

  // Backup states
  const [backupMessage, setBackupMessage] = useState('');
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [pendingRestoreData, setPendingRestoreData] = useState<any | null>(null);

  useEffect(() => {
    return syncManager.subscribe((st, usr) => {
      setSyncStatus(st);
      setCurrentUser(usr);
    });
  }, []);

  // Manejar guardado de Firebase Config
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsed: any;
      if (configJson.trim().startsWith('{')) {
        parsed = JSON.parse(configJson);
      } else {
        throw new Error('Pega el objeto JSON de firebaseConfig proporcionado por la consola de Firebase.');
      }
      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('La configuración debe contener al menos apiKey y projectId.');
      }
      saveFirebaseConfig(parsed);
      setFirebaseConfig(parsed);
      setShowConfigForm(false);
      window.location.reload(); // Recarga para inicializar la nueva conexión
    } catch (err: any) {
      setAuthError(err.message || 'Error en formato de configuración.');
    }
  };

  // Manejar Login / Registro
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Introduce tu correo y contraseña.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    const { auth } = initFirebase();
    if (!auth) {
      setAuthError('Primero debes configurar las credenciales de Firebase abajo.');
      setAuthLoading(false);
      return;
    }
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Error en la autenticación.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { auth } = initFirebase();
    if (auth) {
      await signOut(auth);
    }
  };

  // Manejar creación de etiqueta
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setTagError('El nombre no puede estar vacío.');
      return;
    }
    setTagError('');
    try {
      await onAddTag(newTagName.trim(), newTagColor);
      setNewTagName('');
    } catch (err: any) {
      setTagError(err.message || 'Error al crear la etiqueta.');
    }
  };

  // Exportar respaldo JSON
  const handleExportBackup = async () => {
    try {
      const db = await getDatabase();
      const backup = await exportBackup(db);
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ritmo-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMessage('Copia de seguridad descargada exitosamente.');
    } catch (err: any) {
      setBackupMessage(err.message || 'Error al exportar respaldo.');
    }
  };

  // Seleccionar archivo para restaurar
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseBackup(text);
        setPendingRestoreData(parsed);
      } catch (err: any) {
        setBackupMessage(err.message || 'El archivo seleccionado no es válido.');
      }
    };
    reader.readAsText(file);
  };

  // Confirmar restauración
  const handleConfirmRestore = async () => {
    if (restoreConfirmText !== 'RESTAURAR') {
      setBackupMessage('Escribe la palabra RESTAURAR en mayúsculas para confirmar.');
      return;
    }
    try {
      const db = await getDatabase();
      await restoreBackup(db, pendingRestoreData);
      setPendingRestoreData(null);
      setRestoreConfirmText('');
      setBackupMessage('Respaldo restaurado con éxito.');
      onDataRestored();
    } catch (err: any) {
      setBackupMessage(err.message || 'Error al restaurar los datos.');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Ajustes</h1>
        <p className="page-description">Sincronización en la nube, personalización y respaldos.</p>
      </header>

      {/* 1. SECCIÓN: SINCRONIZACIÓN EN LA NUBE (FIREBASE) */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">
              <Cloud size={20} color="var(--primary)" />
              Sincronización en la Nube (PC y Móvil)
            </h2>
            <span
              className={`sync-badge ${
                currentUser ? 'synced' : 'local-only'
              }`}
            >
              {currentUser ? 'Cuenta conectada' : 'Modo local en este dispositivo'}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Ritmo funciona en modo <strong>Offline-First</strong>: todos tus datos se guardan al instante en tu disco local.
            Al conectar tu cuenta de Firebase, se sincronizan automáticamente en tiempo real entre tu PC y tu teléfono móvil cuando hay internet.
          </p>

          {currentUser ? (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sesión iniciada como:</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {currentUser.email || currentUser.uid}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {firebaseConfig ? (
                <div>
                  <form onSubmit={handleAuth} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {isRegistering ? 'Crear cuenta para sincronizar' : 'Iniciar sesión en Ritmo'}
                    </div>

                    {authError && (
                      <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{authError}</div>
                    )}

                    <div>
                      <label className="form-label">Correo electrónico</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={authLoading}>
                        <LogIn size={15} />
                        {authLoading ? 'Conectando...' : isRegistering ? 'Registrarse' : 'Iniciar sesión'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsRegistering(!isRegistering)}
                      >
                        {isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta'}
                      </button>
                    </div>
                  </form>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowConfigForm(!showConfigForm)}
                    >
                      <Key size={14} /> Modificar credenciales de Firebase
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Para activar la sincronización en la nube gratuita, necesitas vincular las claves de tu proyecto de Firebase (Firestore + Auth).
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowConfigForm(!showConfigForm)}
                  >
                    <Key size={14} /> Configurar Firebase
                  </button>
                </div>
              )}

              {showConfigForm && (
                <form onSubmit={handleSaveFirebaseConfig} style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">
                    Pega el objeto <code>firebaseConfig</code> obtenido de tu Consola de Firebase:
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "tu-app.firebaseapp.com",\n  "projectId": "tu-app",\n  "appId": "1:..."\n}`}
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Guardar configuración
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowConfigForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. SECCIÓN: APARIENCIA */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            <Sun size={20} color="var(--primary)" />
            Apariencia
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'system', label: 'Automático (Sistema)', icon: <Laptop size={15} /> },
              { id: 'light', label: 'Claro', icon: <Sun size={15} /> },
              { id: 'dark', label: 'Oscuro', icon: <Moon size={15} /> },
            ].map((opt) => (
              <button
                key={opt.id}
                className={`btn ${theme === opt.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => onThemeChange(opt.id)}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: ETIQUETAS */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            <TagIcon size={20} color="var(--primary)" />
            Etiquetas personalizadas
          </h2>

          <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Nueva etiqueta (ej. Trabajo, Salud...)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              style={{ flex: 1, minWidth: '180px' }}
              maxLength={40}
            />
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {TAG_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: `2px solid ${newTagColor === c ? 'var(--text-primary)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={15} /> Añadir
            </button>
          </form>

          {tagError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{tagError}</div>}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes etiquetas creadas.</span>
            ) : (
              tags.map((tag) => (
                <span
                  key={tag.id}
                  className="task-badge"
                  style={{
                    backgroundColor: `${tag.color}18`,
                    color: tag.color,
                    border: `1px solid ${tag.color}35`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem',
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => onDeleteTag(tag.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                    title="Eliminar etiqueta"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: RESPALDOS LOCALES (JSON) */}
      <section>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            <HardDrive size={20} color="var(--primary)" />
            Copia de seguridad local (JSON)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Siempre tienes el control total de tus datos. Puedes descargar un archivo JSON completo con todas tus tareas, hábitos y configuraciones, o restaurarlo en cualquier momento.
          </p>

          {backupMessage && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {backupMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExportBackup}>
              <Download size={15} /> Descargar copia de seguridad
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Restaurar copia desde archivo
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {pendingRestoreData && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                border: '1px solid var(--warning)',
                borderRadius: '8px',
                backgroundColor: 'var(--warning-light)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '0.5rem' }}>
                Confirmar restauración
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                El archivo contiene: {backupSummary(pendingRestoreData).tareas} tareas,{' '}
                {backupSummary(pendingRestoreData).hábitos} hábitos y{' '}
                {backupSummary(pendingRestoreData).etiquetas} etiquetas.
                <br />
                <strong>Atención:</strong> Esta acción reemplazará los datos actuales en este dispositivo.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escribe RESTAURAR"
                  value={restoreConfirmText}
                  onChange={(e) => setRestoreConfirmText(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <button className="btn btn-danger btn-sm" onClick={handleConfirmRestore}>
                  Confirmar reemplazo
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPendingRestoreData(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

