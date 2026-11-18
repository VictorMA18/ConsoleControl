import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode } from '../db/schema/enums';
import { calculateRate } from './tariff';

// Cálculos de una sesión que no tocan la base, para usarlos desde la interfaz sin abrir SQLite.

export const MODE_DURATION_MS: Record<SessionMode, number | null> = {
  fijo_30: 30 * 60 * 1000,
  fijo_60: 60 * 60 * 1000,
  fijo_120: 120 * 60 * 1000,
  libre: null,
};

// Monto estimado al abrir la sesión con el motor de tarifas (HU-003): en tiempo fijo, el precio
// del tiempo contratado con sus mandos. En tiempo libre se calcula al cerrar. El diálogo de sesión
// lo muestra en vivo (T14) y startSession lo guarda en la sesión.
export function estimateTotalCents(
  consoleType: ConsoleType,
  mode: SessionMode,
  controllerCount: number,
  rates: RateBlock[],
): number {
  const durationMs = MODE_DURATION_MS[mode];
  if (durationMs === null) {
    return 0;
  }
  return calculateRate({
    consoleType,
    controllerCount,
    playedMinutes: 0,
    contractedMinutes: durationMs / 60_000,
    rates,
  }).totalCents;
}
