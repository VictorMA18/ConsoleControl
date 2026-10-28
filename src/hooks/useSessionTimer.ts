import { elapsedMs, remainingMs, type TimedSession } from '../services/sessionTimer';
import { useNow } from './useNow';

export type SessionTimer = {
  elapsedMs: number;
  // null en tiempo libre.
  remainingMs: number | null;
};

// Cronómetro de una sesión para mostrar en pantalla; se refresca cada segundo (TW-84).
export function useSessionTimer(session: TimedSession): SessionTimer {
  const now = useNow();
  return {
    elapsedMs: elapsedMs(session, now),
    remainingMs: remainingMs(session, now),
  };
}
