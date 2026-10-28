import type { ConsoleType } from '../db/schema/enums';
import type { RateBlock } from '../db/schema/rates';

// Motor de tarificación (HU-003, T13). Reglas del documento de T12 «Tarifas base y regla de
// recargo por mando adicional». Todos los montos son céntimos enteros: S/ 3.50 = 350 (TW-101).

export type { RateBlock };

export const BLOCK_MINUTES = 15;
// RN-03: minutos de gracia al pasar de un bloque.
export const GRACE_MINUTES = 3;
// Descuento del 30 % en el mando adicional desde el 4.º mando, solo en estas consolas.
export const DISCOUNT_FROM_CONTROLLER = 4;
export const DISCOUNTED_CONSOLE_TYPES: readonly ConsoleType[] = ['switch', 'ps5'];

// Minutos jugados → minutos que se cobran, en bloques de 15 con 3 minutos de gracia:
// 1 a 18 → 15, 19 a 33 → 30, 34 a 48 → 45... El mínimo es un bloque.
export function chargedMinutes(playedMinutes: number): number {
  const blocks = Math.ceil((playedMinutes - GRACE_MINUTES) / BLOCK_MINUTES);
  return Math.max(1, blocks) * BLOCK_MINUTES;
}

// Divide los minutos cobrados en bloques con precio: primero 2 horas, luego 1 hora y el resto
// (15, 30 o 45). Por ejemplo, 105 = 60 + 45 y 135 = 120 + 15.
export function splitIntoPricedBlocks(minutes: number): number[] {
  const parts: number[] = [];
  let rest = minutes;
  while (rest >= 120) {
    parts.push(120);
    rest -= 120;
  }
  if (rest >= 60) {
    parts.push(60);
    rest -= 60;
  }
  if (rest > 0) {
    parts.push(rest);
  }
  return parts;
}

// 70 % del precio normal, redondeado hacia abajo a S/ 0.10, con aritmética entera.
export function discountedExtraCents(extraControllerCents: number): number {
  return Math.floor((extraControllerCents * 7) / 100) * 10;
}

export type CalculateRateInput = {
  consoleType: ConsoleType;
  controllerCount: number;
  playedMinutes: number;
  // Tiempo fijo contratado (30, 60 o 120). Nulo en tiempo libre.
  contractedMinutes: number | null;
  rates: readonly RateBlock[];
};

export type RateCalculation = {
  chargedMinutes: number;
  blocks: number[];
  totalCents: number;
};

// calcularTarifa (TW-99). Por cada bloque: precio de la consola + un recargo por cada mando
// desde el segundo (RN-01, TW-100), con descuento desde el 4.º en Switch y PS5.
// En tiempo fijo se cobra al menos lo contratado; si se juega más, se cobra lo jugado.
export function calculateRate(input: CalculateRateInput): RateCalculation {
  const played = chargedMinutes(input.playedMinutes);
  const charged =
    input.contractedMinutes === null ? played : Math.max(input.contractedMinutes, played);
  const blocks = splitIntoPricedBlocks(charged);
  const hasDiscount = DISCOUNTED_CONSOLE_TYPES.includes(input.consoleType);

  let totalCents = 0;
  for (const minutes of blocks) {
    const rate = input.rates.find((r) => r.blockMinutes === minutes);
    if (!rate) {
      throw new Error(`No hay tarifa de ${minutes} min para ${input.consoleType}`);
    }
    totalCents += rate.priceCents;
    for (let controller = 2; controller <= input.controllerCount; controller++) {
      totalCents +=
        hasDiscount && controller >= DISCOUNT_FROM_CONTROLLER
          ? discountedExtraCents(rate.extraControllerCents)
          : rate.extraControllerCents;
    }
  }

  return { chargedMinutes: charged, blocks, totalCents };
}
