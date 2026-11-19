import type { ConsoleType } from '../../src/db/schema/enums';
import type { RateBlock } from '../../src/db/schema';
import { seedRates } from '../../src/db/seedData';
import { calculateRate } from '../../src/services/tariff';

// Casos de docs/qa/casos-de-prueba.md con los montos de docs/qa/datos-de-prueba.md y los casos de
// ejemplo de docs/architecture/tarifario.md. Prueban el motor con las tarifas del seed.

function ratesOf(consoleType: ConsoleType): RateBlock[] {
  return seedRates
    .filter((rate) => rate.consoleType === consoleType)
    .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
      blockMinutes,
      priceCents,
      extraControllerCents,
    }));
}

function fixedTimeTotal(
  consoleType: ConsoleType,
  contractedMinutes: number,
  controllerCount: number,
): number {
  return calculateRate({
    consoleType,
    controllerCount,
    playedMinutes: 0,
    contractedMinutes,
    rates: ratesOf(consoleType),
  }).totalCents;
}

describe('CP-007 · recargo por mando adicional (D-03)', () => {
  it.each([
    ['ps4', 1, 700],
    ['ps4', 2, 1000],
    ['ps4', 3, 1300],
    ['ps5', 2, 1450],
  ] as const)('CP-007 %s de 60 min con %i mandos cuesta %i céntimos', (type, count, total) => {
    expect(fixedTimeTotal(type, 60, count)).toBe(total);
  });
});

describe('CP-008 · tiempo fijo con 1 mando (D-04)', () => {
  it.each([
    ['ps3', 250, 500, 900],
    ['ps4', 350, 700, 1300],
    ['switch', 400, 800, 1500],
    ['ps5', 500, 1000, 1900],
    ['xbox', 500, 1000, 1900],
  ] as const)('CP-008 %s coincide con el tarifario', (type, min30, min60, min120) => {
    expect(fixedTimeTotal(type, 30, 1)).toBe(min30);
    expect(fixedTimeTotal(type, 60, 1)).toBe(min60);
    expect(fixedTimeTotal(type, 120, 1)).toBe(min120);
  });
});

describe('casos de ejemplo del tarifario (T12)', () => {
  it.each([
    ['ps4', 1, 60, 60, 700],
    ['ps4', 3, 60, 60, 1300],
    ['ps5', 6, 60, 60, 2830],
    ['xbox', 2, null, 50, 1450],
    ['switch', 1, null, 135, 1700],
  ] as const)(
    '%s con %i mandos (contratado %p, jugado %i min) cuesta %i céntimos',
    (type, count, contracted, played, total) => {
      expect(
        calculateRate({
          consoleType: type,
          controllerCount: count,
          playedMinutes: played,
          contractedMinutes: contracted,
          rates: ratesOf(type),
        }).totalCents,
      ).toBe(total);
    },
  );
});
