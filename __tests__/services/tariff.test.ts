import type { ConsoleType } from '../../src/db/schema/enums';
import { seedRates } from '../../src/db/seedData';
import {
  calculateRate,
  chargedMinutes,
  discountedExtraCents,
  type RateBlock,
  splitIntoPricedBlocks,
} from '../../src/services/tariff';

// Tarifario de cada consola desde los datos iniciales (CSV del documento de T12).
function ratesOf(consoleType: ConsoleType): RateBlock[] {
  return seedRates
    .filter((r) => r.consoleType === consoleType)
    .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
      blockMinutes,
      priceCents,
      extraControllerCents,
    }));
}

describe('chargedMinutes · bloques de 15 min con 3 min de gracia (RN-03)', () => {
  it.each([
    [0, 15],
    [1, 15],
    [12, 15],
    [17, 15],
    [18, 15],
    [19, 30],
    [33, 30],
    [34, 45],
    [48, 45],
    [49, 60],
    [63, 60],
    [64, 75],
    [108, 105],
    [109, 120],
    [123, 120],
    [124, 135],
  ])('%i min jugados se cobran como %i', (played, charged) => {
    expect(chargedMinutes(played)).toBe(charged);
  });
});

describe('splitIntoPricedBlocks · pasada la hora se suman los precios', () => {
  it.each([
    [15, [15]],
    [45, [45]],
    [60, [60]],
    [75, [60, 15]],
    [105, [60, 45]],
    [120, [120]],
    [135, [120, 15]],
    [180, [120, 60]],
    [255, [120, 120, 15]],
  ])('%i min = %j', (minutes, blocks) => {
    expect(splitIntoPricedBlocks(minutes)).toEqual(blocks);
  });
});

describe('discountedExtraCents · 70 % redondeado hacia abajo a S/ 0.10', () => {
  it.each([
    // Valores de la tabla de descuentos del documento de T12.
    [50, 30],
    [80, 50],
    [100, 70],
    [150, 100],
    [250, 170],
    [450, 310],
    // Valores del CSV.
    [200, 140],
    [850, 590],
  ])('%i céntimos con descuento = %i', (normal, discounted) => {
    expect(discountedExtraCents(normal)).toBe(discounted);
  });
});

// Casos C1 a C8 del documento de T12, recalculados con los precios del CSV (PROVISIONALES: el
// documento calcula C1 a C8 con los precios de sus tablas). C4 y C8 coinciden con sus
// «ejemplos de lectura». C7 es una extensión de tiempo (HU-009) y queda para ese sprint.
describe('calculateRate · casos de ejemplo de T12 (TW-102)', () => {
  it.each([
    ['C1', 'ps3', 1, 30, 30, 30, 250],
    ['C2', 'ps5', 2, 60, 60, 60, 1450],
    ['C3', 'ps4', 4, 120, 120, 120, 2950],
    ['C4', 'ps4', 3, null, 12, 15, 400],
    ['C5', 'switch', 3, 60, 75, 75, 1900],
    ['C6', 'ps3', 3, null, 40, 45, 700],
    ['C8', 'ps4', 1, 60, 62, 60, 700],
  ] as const)(
    '%s: %s con %i mandos, contratado %s min, jugados %i → cobra %i min y %i céntimos',
    (_case, consoleType, controllerCount, contractedMinutes, playedMinutes, charged, total) => {
      const result = calculateRate({
        consoleType,
        controllerCount,
        playedMinutes,
        contractedMinutes,
        rates: ratesOf(consoleType),
      });
      expect(result.chargedMinutes).toBe(charged);
      expect(result.totalCents).toBe(total);
    },
  );
});

describe('calculateRate · RN-01 recargo por mando desde el segundo (TW-100)', () => {
  const ps4 = ratesOf('ps4');

  it('con 1 mando cobra solo el precio de la consola', () => {
    const result = calculateRate({
      consoleType: 'ps4',
      controllerCount: 1,
      playedMinutes: 60,
      contractedMinutes: 60,
      rates: ps4,
    });
    expect(result.totalCents).toBe(700);
  });

  it('suma un recargo por cada mando extra', () => {
    const result = calculateRate({
      consoleType: 'ps4',
      controllerCount: 3,
      playedMinutes: 60,
      contractedMinutes: 60,
      rates: ps4,
    });
    expect(result.totalCents).toBe(700 + 2 * 300);
  });

  it('en PS4 no hay descuento desde el 4.º mando', () => {
    const result = calculateRate({
      consoleType: 'ps4',
      controllerCount: 6,
      playedMinutes: 30,
      contractedMinutes: 30,
      rates: ps4,
    });
    expect(result.totalCents).toBe(350 + 5 * 150);
  });

  it('en Switch descuenta el 30 % desde el 4.º mando', () => {
    const result = calculateRate({
      consoleType: 'switch',
      controllerCount: 5,
      playedMinutes: 30,
      contractedMinutes: 30,
      rates: ratesOf('switch'),
    });
    // 4.00 + 2 × 2.00 (2.º y 3.º) + 2 × 1.40 (4.º y 5.º).
    expect(result.totalCents).toBe(400 + 2 * 200 + 2 * 140);
  });

  it('en PS5 descuenta el 30 % desde el 4.º mando en cada bloque', () => {
    const result = calculateRate({
      consoleType: 'ps5',
      controllerCount: 4,
      playedMinutes: 120,
      contractedMinutes: 120,
      rates: ratesOf('ps5'),
    });
    // 19.00 + 2 × 8.50 + 1 × 5.90.
    expect(result.totalCents).toBe(1900 + 2 * 850 + 590);
  });
});

describe('calculateRate · tiempo contratado y tiempo libre', () => {
  it('si juega menos de lo contratado, cobra lo contratado', () => {
    const result = calculateRate({
      consoleType: 'ps4',
      controllerCount: 1,
      playedMinutes: 10,
      contractedMinutes: 60,
      rates: ratesOf('ps4'),
    });
    expect(result.chargedMinutes).toBe(60);
    expect(result.totalCents).toBe(700);
  });

  it('en tiempo libre largo suma los bloques: 150 min = 2 h + 30 min', () => {
    const result = calculateRate({
      consoleType: 'ps4',
      controllerCount: 2,
      playedMinutes: 150,
      contractedMinutes: null,
      rates: ratesOf('ps4'),
    });
    expect(result.blocks).toEqual([120, 30]);
    expect(result.totalCents).toBe(1300 + 550 + (350 + 150));
  });

  it('falla si falta el precio de un bloque', () => {
    expect(() =>
      calculateRate({
        consoleType: 'ps4',
        controllerCount: 1,
        playedMinutes: 30,
        contractedMinutes: null,
        rates: [],
      }),
    ).toThrow('No hay tarifa de 30 min para ps4');
  });
});

describe('calculateRate · aritmética en céntimos (TW-101)', () => {
  it('devuelve siempre céntimos enteros', () => {
    for (const consoleType of ['ps3', 'ps4', 'ps5', 'xbox', 'switch'] as const) {
      for (let controllers = 1; controllers <= 6; controllers++) {
        for (let played = 0; played <= 300; played += 7) {
          const { totalCents } = calculateRate({
            consoleType,
            controllerCount: controllers,
            playedMinutes: played,
            contractedMinutes: null,
            rates: ratesOf(consoleType),
          });
          expect(Number.isInteger(totalCents)).toBe(true);
        }
      }
    }
  });
});

describe('calculateRate · rendimiento (TW-103, RNF-01)', () => {
  it('un cálculo tarda menos de 100 ms', () => {
    const rates = ratesOf('ps5');
    const start = performance.now();
    calculateRate({
      consoleType: 'ps5',
      controllerCount: 6,
      playedMinutes: 600,
      contractedMinutes: null,
      rates,
    });
    expect(performance.now() - start).toBeLessThan(100);
  });

  it('1000 cálculos seguidos tardan menos de 100 ms en total', () => {
    const rates = ratesOf('ps5');
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      calculateRate({
        consoleType: 'ps5',
        controllerCount: 1 + (i % 6),
        playedMinutes: i % 300,
        contractedMinutes: null,
        rates,
      });
    }
    expect(performance.now() - start).toBeLessThan(100);
  });
});
