import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from 'expo-network';
import { AppState } from 'react-native';

import { countPendingRecords } from '../db/repositories/syncRepository';
import { useSyncStore } from '../stores/syncStore';
import { sqliteSyncSource } from './localSource';
import { getRemoteStore } from './remote';
import { retryDelayMs, runSync } from './syncEngine';

// Monitor de conectividad y bucle de sincronización (HU-008b, ADR 0015). Sincroniza al arrancar,
// al recuperar la conexión, al volver la app a primer plano y cada minuto. Corre aparte de la
// interfaz y nunca lanza: sin internet espera (RN-09).

const PERIODIC_SYNC_MS = 60_000;
// El conteo de pendientes es barato (una consulta por tabla): se refresca más seguido.
const PENDING_REFRESH_MS = 10_000;

function isOnline(state: Pick<NetworkState, 'isConnected' | 'isInternetReachable'>): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

async function refreshPending(): Promise<void> {
  try {
    useSyncStore.getState().set({ pending: await countPendingRecords() });
  } catch {
    // Si la base no responde, el indicador conserva el último número.
  }
}

// Arranca el bucle y devuelve la función que lo detiene (para el efecto de app/_layout.tsx).
export function startSyncLoop(): () => void {
  const store = useSyncStore.getState();
  const remote = getRemoteStore();
  store.set({ configured: remote !== null });

  let running = false;
  let failedAttempts = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  async function sync(): Promise<void> {
    await refreshPending();
    const { online } = useSyncStore.getState();
    if (stopped || running || remote === null || !online) {
      return;
    }
    running = true;
    useSyncStore.getState().set({ syncing: true });
    const result = await runSync(sqliteSyncSource, remote);
    running = false;
    if (result.ok) {
      failedAttempts = 0;
      useSyncStore.getState().set({ syncing: false, lastSyncedAt: Date.now(), lastError: null });
    } else {
      failedAttempts += 1;
      useSyncStore.getState().set({ syncing: false, lastError: result.error });
      // Reintento con espera creciente; el intervalo periódico sigue de todas formas.
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      retryTimer = setTimeout(() => void sync(), retryDelayMs(failedAttempts));
    }
    await refreshPending();
  }

  function setOnline(state: Pick<NetworkState, 'isConnected' | 'isInternetReachable'>): void {
    const wasOnline = useSyncStore.getState().online;
    const online = isOnline(state);
    useSyncStore.getState().set({ online });
    if (online && !wasOnline) {
      failedAttempts = 0;
      void sync();
    }
  }

  getNetworkStateAsync()
    .then((state) => {
      setOnline(state);
      void sync();
    })
    .catch(() => void sync());
  const network = addNetworkStateListener(setOnline);
  const appState = AppState.addEventListener('change', (next) => {
    if (next === 'active') {
      void sync();
    }
  });
  const periodic = setInterval(() => void sync(), PERIODIC_SYNC_MS);
  const pendingTimer = setInterval(() => void refreshPending(), PENDING_REFRESH_MS);

  return () => {
    stopped = true;
    network.remove();
    appState.remove();
    clearInterval(periodic);
    clearInterval(pendingTimer);
    if (retryTimer) {
      clearTimeout(retryTimer);
    }
  };
}
