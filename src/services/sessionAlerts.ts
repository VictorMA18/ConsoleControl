import type { Session } from '../db/schema';
import { remainingMs } from './sessionTimer';

// Estado de alerta de una sesión (HU-004, T15). No se guarda en la base: se calcula desde
// started_at y duration_ms cada vez, igual que el cronómetro (ADR 0003, decisión M4). Así una
// sesión sigue en «Tiempo cumplido» aunque se cierre la app, hasta que se liquide (HU-005).

// RN-02: minutos antes del fin en que la tarjeta pasa a ámbar y el celular vibra.
export const ALERT_BEFORE_MS = 5 * 60 * 1000;

export type SessionAlertState =
  // Tiempo libre: no vence, no hay alerta.
  | 'libre'
  // Tiempo fijo con más de 5 minutos por delante.
  | 'en_curso'
  // Faltan 5 minutos o menos (RN-02).
  | 'proxima_a_vencer'
  // El tiempo se agotó y la sesión sigue activa, sin liquidar.
  | 'tiempo_cumplido'
  // La sesión ya se cerró.
  | 'finalizada';

export type AlertableSession = Pick<Session, 'startedAt' | 'endedAt' | 'durationMs' | 'status'>;

// TW-108 y TW-109. Recibe la hora como parámetro para poder probarla con un reloj fijo.
export function getSessionAlertState(
  session: AlertableSession,
  now: number = Date.now(),
): SessionAlertState {
  if (session.status === 'finalizada') {
    return 'finalizada';
  }
  const remaining = remainingMs(session, now);
  if (remaining === null) {
    return 'libre';
  }
  if (remaining === 0) {
    return 'tiempo_cumplido';
  }
  return remaining <= ALERT_BEFORE_MS ? 'proxima_a_vencer' : 'en_curso';
}

// Aviso que recibe la interfaz cuando una sesión entra en un estado de alerta (TW-110).
export type SessionAlert = {
  type: 'proxima_a_vencer' | 'tiempo_cumplido';
  sessionId: string;
  consoleId: string;
  consoleName: string;
  remainingMs: number;
};

export type TrackedSession = AlertableSession &
  Pick<Session, 'id' | 'consoleId'> & { consoleName: string };

// Recuerda qué avisos ya se dieron por sesión para no repetirlos (TW-111). Vive en memoria
// mientras la app está abierta: al reabrirla, una sesión que sigue en alerta avisa una vez más,
// porque el administrador pudo no ver el primer aviso.
export function createAlertTracker() {
  const sent = new Map<string, Set<SessionAlert['type']>>();

  return {
    // Devuelve los avisos nuevos de este instante. Si una sesión pasa de «en curso» directo a
    // «tiempo cumplido» (la app estuvo en segundo plano), solo avisa del tiempo cumplido.
    check(sessions: readonly TrackedSession[], now: number = Date.now()): SessionAlert[] {
      const alerts: SessionAlert[] = [];
      const activeIds = new Set<string>();

      for (const session of sessions) {
        activeIds.add(session.id);
        const state = getSessionAlertState(session, now);
        if (state !== 'proxima_a_vencer' && state !== 'tiempo_cumplido') {
          // Si volvió a «en curso» (por ejemplo, al extender el tiempo en HU-009), podrá
          // avisar de nuevo cuando le falten 5 minutos otra vez.
          sent.delete(session.id);
          continue;
        }
        const sentForSession = sent.get(session.id) ?? new Set();
        if (sentForSession.has(state)) {
          continue;
        }
        sentForSession.add(state);
        sent.set(session.id, sentForSession);
        alerts.push({
          type: state,
          sessionId: session.id,
          consoleId: session.consoleId,
          consoleName: session.consoleName,
          remainingMs: remainingMs(session, now) ?? 0,
        });
      }

      // Olvida las sesiones que ya no están activas.
      for (const id of sent.keys()) {
        if (!activeIds.has(id)) {
          sent.delete(id);
        }
      }
      return alerts;
    },
  };
}

export type AlertTracker = ReturnType<typeof createAlertTracker>;
