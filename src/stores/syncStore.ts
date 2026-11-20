import { create } from 'zustand';

// Estado de la sincronización para el indicador del muro (HU-008). Solo estado de pantalla: los
// registros pendientes de verdad están en SQLite.
export type SyncIndicatorState =
  'sin_conexion' | 'sin_configurar' | 'sincronizando' | 'pendiente' | 'actualizada';

type SyncState = {
  online: boolean;
  syncing: boolean;
  pending: number;
  // Hay una nube configurada (variables de entorno de Supabase, HU-008c).
  configured: boolean;
  lastSyncedAt: number | null;
  lastError: string | null;
  set: (changes: Partial<Omit<SyncState, 'set'>>) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  online: true,
  syncing: false,
  pending: 0,
  configured: false,
  lastSyncedAt: null,
  lastError: null,
  set: (changes) => set(changes),
}));

// Qué muestra el indicador. Función pura para que la regla se lea en un solo sitio.
export function indicatorState(state: {
  online: boolean;
  syncing: boolean;
  pending: number;
  configured: boolean;
}): SyncIndicatorState {
  if (!state.online) {
    return 'sin_conexion';
  }
  if (!state.configured) {
    return 'sin_configurar';
  }
  if (state.syncing) {
    return 'sincronizando';
  }
  return state.pending > 0 ? 'pendiente' : 'actualizada';
}
