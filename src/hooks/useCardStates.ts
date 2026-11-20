import { getSessionAlertState } from '../services/sessionAlerts';
import { cardState, type CardState } from '../utils/cardState';
import { useActiveSessions } from './useActiveSessions';
import { useConsoles } from './useConsoles';
import { useNow } from './useNow';
import { usePendingSessions } from './usePendingSessions';

// Estado visible de cada consola (el de su tarjeta del muro), recalculado cada segundo. Lo usa la
// pestaña Resumen para contar cuántas hay en cada estado.
export function useCardStates(): CardState[] {
  const now = useNow();
  const { data: consoles } = useConsoles();
  const { data: sessions } = useActiveSessions();
  const { data: pending } = usePendingSessions();
  const byConsole = new Map([...(sessions ?? []), ...(pending ?? [])].map((s) => [s.consoleId, s]));
  return (consoles ?? []).map((c) => {
    const session = byConsole.get(c.id);
    return cardState(c.status, session ? getSessionAlertState(session, now) : null);
  });
}
