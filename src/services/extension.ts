import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode, SessionStatus } from '../db/schema/enums';
import { calculateRate } from './tariff';

// Extensión de tiempo de una sesión en curso (HU-009). Funciones puras: reciben la hora por
// parámetro y no tocan la base.

// Las mismas duraciones que al iniciar una sesión (regla de VN, 19/11/2026).
export const EXTENSION_MINUTES = [30, 60, 120] as const;
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
      reason: 'bloque_invalido' | 'tiempo_libre' | 'sesion_no_activa';
      message: string;
    };

export function isExtensionMinutes(minutes: number): minutes is ExtensionMinutes {
  return (EXTENSION_MINUTES as readonly number[]).includes(minutes);
}

// Calcula la sesión extendida: la duración contratada crece en el bloque, el vencimiento es
// started_at + duración (el cronómetro no se reinicia, ADR 0003) y el monto se recalcula con el
// motor de HU-003 sobre las tarifas guardadas en la sesión (RN-08).
// También se extiende con el tiempo ya cumplido: sumar tiempo cubre el exceso (decisión de VN).
export function planExtension(
  session: ExtendableSession,
  minutes: number,
  now: number,
): ExtensionPlan {
  if (!isExtensionMinutes(minutes)) {
    return {
      ok: false,
      reason: 'bloque_invalido',
      message: 'Solo se añaden 30 minutos, 1 hora o 2 horas',
    };
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
