import type { Session } from '../db/schema';

// Tiempo de las sesiones (HU-002). Nunca se guarda ni se cuenta en memoria: se calcula desde
// started_at cada vez que se necesita, así sobrevive a minimizar, cerrar o reiniciar (ADR 0003).
// Las funciones reciben la hora como parámetro para poder probarlas.

export type TimedSession = Pick<Session, 'startedAt' | 'endedAt' | 'durationMs'>;

// Tiempo transcurrido. En una sesión finalizada se detiene en ended_at.
// Si la hora del celular se atrasó y queda antes de started_at, devuelve 0 en vez de un negativo.
export function elapsedMs(session: TimedSession, now: number = Date.now()): number {
  const end = session.endedAt ?? now;
  return Math.max(0, end - session.startedAt);
}

// Tiempo que falta en una sesión de tiempo fijo, sin bajar de 0. En tiempo libre devuelve null.
export function remainingMs(session: TimedSession, now: number = Date.now()): number | null {
  if (session.durationMs === null) {
    return null;
  }
  return Math.max(0, session.durationMs - elapsedMs(session, now));
}
