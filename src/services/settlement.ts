import type { RateBlock } from '../db/schema';
import type { ConsoleType } from '../db/schema/enums';
import { calculateRate } from './tariff';

// Liquidación de una sesión al finalizarla (HU-005, RN-03). Es una función pura: recibe todo por
// parámetro, no abre la base y no cuenta nada en memoria. Los minutos jugados salen de
// fin − started_at (ADR 0003). La gracia de 3 minutos y las fracciones de 15 son las de tariff.ts.

export type SettlementInput = {
  consoleType: ConsoleType;
  controllerCount: number;
  // Duración contratada en milisegundos; nula en tiempo libre.
  durationMs: number | null;
  startedAt: number;
  endedAt: number;
  // Copia de las tarifas guardada en la sesión (RN-08).
  rates: readonly RateBlock[];
};

export type Settlement = {
  playedMinutes: number;
  // Nulo en tiempo libre.
  contractedMinutes: number | null;
  // Minutos que se cobran (bloques de 15).
  chargedMinutes: number;
  // Minutos cobrados por encima de lo contratado, ya descontada la gracia.
  extraMinutes: number;
  controllerCount: number;
  // Precio de lo contratado (en tiempo libre, el total).
  baseCents: number;
  // Cobro por el exceso. Cero en tiempo libre.
  penaltyCents: number;
  totalCents: number;
};

export function calculateSettlement(input: SettlementInput): Settlement {
  // Se redondea hacia arriba: un segundo más allá de la gracia ya cuenta como minuto.
  const playedMinutes = Math.ceil(Math.max(0, input.endedAt - input.startedAt) / 60_000);
  const contractedMinutes = input.durationMs === null ? null : input.durationMs / 60_000;
  const common = {
    consoleType: input.consoleType,
    controllerCount: input.controllerCount,
    contractedMinutes,
    rates: input.rates,
  };

  const result = calculateRate({ ...common, playedMinutes });
  const baseCents =
    contractedMinutes === null
      ? result.totalCents
      : calculateRate({ ...common, playedMinutes: 0 }).totalCents;

  return {
    playedMinutes,
    contractedMinutes,
    chargedMinutes: result.chargedMinutes,
    extraMinutes:
      contractedMinutes === null ? 0 : Math.max(0, result.chargedMinutes - contractedMinutes),
    controllerCount: input.controllerCount,
    baseCents,
    penaltyCents: result.totalCents - baseCents,
    totalCents: result.totalCents,
  };
}
