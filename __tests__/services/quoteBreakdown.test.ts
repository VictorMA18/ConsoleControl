import { CONSOLE_TYPES } from '../../src/db/schema/enums';
import { seedRates } from '../../src/db/seedData';
import { estimateTotalCents, quoteBreakdown } from '../../src/services/sessionQuote';

const ratesOf = (type: (typeof CONSOLE_TYPES)[number]) =>
  seedRates
    .filter((r) => r.consoleType === type)
    .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
      blockMinutes,
      priceCents,
      extraControllerCents,
    }));

describe('desglose del total estimado', () => {
  it('PS5, 1 h, 6 mandos: 10.00 + 2 × 4.50 + 3 × 3.10 = S/ 28.30 (caso 3 del tarifario)', () => {
    expect(quoteBreakdown('ps5', 'fijo_60', 6, ratesOf('ps5'))).toEqual({
      baseCents: 1000,
      regular: { count: 2, unitCents: 450 },
      discounted: { count: 3, unitCents: 310 },
      totalCents: 2830,
    });
  });

  it('suma siempre lo mismo que el motor de tarifas', () => {
    for (const type of CONSOLE_TYPES) {
      for (const mode of ['fijo_30', 'fijo_60', 'fijo_120'] as const) {
        for (let controllers = 1; controllers <= 6; controllers++) {
          const rates = ratesOf(type);
          expect(quoteBreakdown(type, mode, controllers, rates)?.totalCents).toBe(
            estimateTotalCents(type, mode, controllers, rates),
          );
        }
      }
    }
  });

  it('en tiempo libre no hay desglose', () => {
    expect(quoteBreakdown('ps4', 'libre', 2, ratesOf('ps4'))).toBeNull();
  });
});
