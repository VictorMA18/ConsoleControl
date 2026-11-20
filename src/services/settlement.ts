import type { RateBlock } from '../db/schema';
import type { ConsoleType } from '../db/schema/enums';
import { calculateRate, proRatedCents } from './tariff';

// Liquidación de una sesión al finalizarla (HU-005). Es una función pura: recibe todo por
// parámetro, no abre la base y no cuenta nada en memoria. Los minutos jugados salen de
// fin − started_at (ADR 0003).
// - Tiempo fijo: se cobra el tiempo jugado, aunque se haya cortado antes o pasado de lo
//   contratado, con el precio por hora y sus mandos, redondeado hacia arriba a S/ 0.10
//   (proRatedCents, regla de VN del 19/11/2026).
// - Tiempo libre: bloques de 15 minutos con 3 de gracia (RN-03, tariff.ts).

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
  // Minutos que se cobran: los jugados en tiempo fijo; bloques de 15 en tiempo libre.
  chargedMinutes: number;
  // Minutos jugados por encima de lo contratado (cero en tiempo libre).
  extraMinutes: number;
  controllerCount: number;
  // Parte del total que corresponde al tiempo contratado (en tiempo libre, el total).
  baseCents: number;
  // Parte del total por el tiempo jugado de más. Cero en tiempo libre.
  penaltyCents: number;
  totalCents: number;
};

export function calculateSettlement(input: SettlementInput): Settlement {
  // Se redondea hacia arriba: un segundo más ya cuenta como minuto.
  const playedMinutes = Math.ceil(Math.max(0, input.endedAt - input.startedAt) / 60_000);
  const common = {
    consoleType: input.consoleType,
    controllerCount: input.controllerCount,
    rates: input.rates,
  };

  if (input.durationMs === null) {
    const result = calculateRate({ ...common, contractedMinutes: null, playedMinutes });
    return {
      playedMinutes,
      contractedMinutes: null,
      chargedMinutes: result.chargedMinutes,
      extraMinutes: 0,
      controllerCount: input.controllerCount,
      baseCents: result.totalCents,
      penaltyCents: 0,
      totalCents: result.totalCents,
    };
  }

  const contractedMinutes = input.durationMs / 60_000;
  // Precio de una hora con estos mandos (incluye el descuento de grupo).
  const hourCents = calculateRate({
    ...common,
    contractedMinutes: 60,
    playedMinutes: 0,
  }).totalCents;
  // Mínimo un minuto: una sesión abierta y cerrada al instante no queda en cero por error.
  const charged = Math.max(1, playedMinutes);
  const totalCents = proRatedCents(hourCents, charged);
  // Lo que corresponde al tiempo contratado y lo que se jugó de más, para mostrarlo separado.
  const baseCents = Math.min(
    totalCents,
    proRatedCents(hourCents, Math.min(charged, contractedMinutes)),
  );
  return {
    playedMinutes,
    contractedMinutes,
    chargedMinutes: charged,
    extraMinutes: Math.max(0, charged - contractedMinutes),
    controllerCount: input.controllerCount,
    baseCents,
    penaltyCents: totalCents - baseCents,
    totalCents,
  };
}
