import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode } from '../db/schema/enums';
import {
  calculateRate,
  DISCOUNT_FROM_CONTROLLER,
  DISCOUNTED_CONSOLE_TYPES,
  discountedExtraCents,
} from './tariff';

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

export type QuoteBreakdown = {
  // Precio del bloque contratado con 1 mando.
  baseCents: number;
  // Mandos desde el 2.º con el extra normal.
  regular: { count: number; unitCents: number };
  // Mandos desde el 4.º con 30 % de descuento (solo PS5 y Switch); count 0 si no aplica.
  discounted: { count: number; unitCents: number };
  totalCents: number;
};

// Desglose del total estimado en tiempo fijo, para que quien atiende vea de dónde sale el monto:
// precio de la consola + extra por cada mando desde el 2.º (RN-01) con el descuento de grupo. Los
// tiempos fijos (30 min, 1 h, 2 h) son un solo bloque del tarifario. Nulo en tiempo libre o sin
// tarifa para el bloque.
export function quoteBreakdown(
  consoleType: ConsoleType,
  mode: SessionMode,
  controllerCount: number,
  rates: readonly RateBlock[],
): QuoteBreakdown | null {
  const durationMs = MODE_DURATION_MS[mode];
  const rate =
    durationMs === null ? undefined : rates.find((r) => r.blockMinutes === durationMs / 60_000);
  if (!rate) {
    return null;
  }
  const extras = Math.max(0, controllerCount - 1);
  const hasDiscount = DISCOUNTED_CONSOLE_TYPES.includes(consoleType);
  const discountedCount = hasDiscount
    ? Math.max(0, controllerCount - DISCOUNT_FROM_CONTROLLER + 1)
    : 0;
  const regular = { count: extras - discountedCount, unitCents: rate.extraControllerCents };
  const discounted = {
    count: discountedCount,
    unitCents: discountedExtraCents(rate.extraControllerCents),
  };
  return {
    baseCents: rate.priceCents,
    regular,
    discounted,
    totalCents:
      rate.priceCents + regular.count * regular.unitCents + discounted.count * discounted.unitCents,
  };
}
