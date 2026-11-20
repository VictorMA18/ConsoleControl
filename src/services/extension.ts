import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode, SessionStatus } from '../db/schema/enums';
import { calculateRate } from './tariff';

// Extensión de tiempo de una sesión en curso (HU-009). Funciones puras: reciben la hora por
// parámetro y no tocan la base.

export const EXTENSION_MINUTES = [15, 30] as const;
export type ExtensionMinutes = (typeof EXTENSION_MINUTES)[number];

export type ExtendableSession = {
  consoleType: ConsoleType;
  controllerCount: number;
  mode: SessionMode;
  status: SessionStatus;
  durationMs: number | null;
  startedAt: number;
  totalCents: number;
  rateSnapshot: readonly RateBlock[];
};

export type ExtensionPlan =
  | { ok: true; minutes: ExtensionMinutes; durationMs: number; endsAt: number; totalCents: number }
  | {
      ok: false;
      reason: 'bloque_invalido' | 'tiempo_libre' | 'sesion_no_activa' | 'tiempo_cumplido';
      message: string;
    };

export function isExtensionMinutes(minutes: number): minutes is ExtensionMinutes {
  return (EXTENSION_MINUTES as readonly number[]).includes(minutes);
}

// Calcula la sesión extendida: la duración contratada crece en el bloque, el vencimiento es
// started_at + duración (el cronómetro no se reinicia, ADR 0003) y el monto se recalcula con el
// motor de HU-003 sobre las tarifas guardadas en la sesión (RN-08).
// Por confirmar con VN: con el tiempo ya cumplido no se extiende; se finaliza y se cobra el exceso.
export function planExtension(
  session: ExtendableSession,
  minutes: number,
  now: number,
): ExtensionPlan {
  if (!isExtensionMinutes(minutes)) {
    return { ok: false, reason: 'bloque_invalido', message: 'Solo se añaden 15 o 30 minutos' };
  }
  if (session.status !== 'activa') {
    return { ok: false, reason: 'sesion_no_activa', message: 'La sesión ya fue finalizada' };
  }
  if (session.mode === 'libre' || session.durationMs === null) {
    return {
      ok: false,
      reason: 'tiempo_libre',
      message: 'En tiempo libre no hace falta añadir tiempo',
    };
  }
  if (now >= session.startedAt + session.durationMs) {
    return {
      ok: false,
      reason: 'tiempo_cumplido',
      message: 'El tiempo ya se cumplió: finaliza la sesión para cobrar el exceso',
    };
  }

  const durationMs = session.durationMs + minutes * 60_000;
  const { totalCents } = calculateRate({
    consoleType: session.consoleType,
    controllerCount: session.controllerCount,
    playedMinutes: 0,
    contractedMinutes: durationMs / 60_000,
    rates: session.rateSnapshot,
  });
  return { ok: true, minutes, durationMs, endsAt: session.startedAt + durationMs, totalCents };
}
