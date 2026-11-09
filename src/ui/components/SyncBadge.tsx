import React, { useEffect, useState } from 'react';
import { syncManager, type SyncStatus } from '../../services/syncService';
import { Cloud, CloudOff, RefreshCw, HardDrive, AlertCircle } from 'lucide-react';

export function SyncBadge() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    return syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  if (status === 'synced') {
    return (
      <span className="sync-badge synced" title="Tus datos están sincronizados con la nube">
        <Cloud size={13} />
        <span>Sincronizado</span>
      </span>
    );
  }

  if (status === 'syncing') {
    return (
      <span className="sync-badge syncing" title="Sincronizando cambios en la nube...">
        <RefreshCw size={13} className="animate-spin" />
        <span>Sincronizando…</span>
      </span>
    );
  }

  if (status === 'offline') {
    return (
      <span className="sync-badge offline" title="Sin conexión: los datos se guardan en tu dispositivo y se sincronizarán al conectarte">
        <CloudOff size={13} />
        <span>Sin internet (en disco)</span>
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="sync-badge offline" title="Error en sincronización">
        <AlertCircle size={13} />
        <span>Error de sync</span>
      </span>
    );
  }

  return (
    <span className="sync-badge local-only" title="Modo local en dispositivo">
      <HardDrive size={13} />
      <span>Modo local</span>
    </span>
  );
}

