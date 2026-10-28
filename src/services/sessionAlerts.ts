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
