import type { RateBlock } from '../../src/db/schema';
import { calculateSettlement, type SettlementInput } from '../../src/services/settlement';

// Tarifas de la propia prueba, no las del seed: las cuentas no dependen de datos que cambien.
// Precios en céntimos: 15 min S/ 2.00, 30 min S/ 3.50, 45 min S/ 5.00, 60 min S/ 6.00, 120 min S/ 10.00;
// cada mando extra cuesta S/ 1.00 por bloque.
const RATES: RateBlock[] = [
  [15, 200],
  [30, 350],
  [45, 500],
  [60, 600],
  [120, 1000],
].map(([blockMinutes, priceCents]) => ({
  id: String(blockMinutes),
  consoleType: 'ps4',
  blockMinutes,
  priceCents,
  extraControllerCents: 100,
})) as unknown as RateBlock[];

const MINUTE = 60_000;
const START = 1_760_000_000_000;

function settle(overrides: Partial<SettlementInput> & { playedMs: number }) {
  const { playedMs, ...rest } = overrides;
  return calculateSettlement({
    consoleType: 'ps4',
    controllerCount: 1,
    durationMs: 60 * MINUTE,
    startedAt: START,
    endedAt: START + playedMs,
    rates: RATES,
    ...rest,
  });
}

describe('calculateSettlement (HU-005)', () => {
  it('sin exceso, el total es el monto base y no hay penalidad', () => {
    const result = settle({ playedMs: 55 * MINUTE });
    expect(result).toMatchObject({ playedMinutes: 55, extraMinutes: 0, penaltyCents: 0 });
    expect(result.totalCents).toBe(600);
  });

  it('con un exceso de hasta 3 minutos no cobra penalidad', () => {
    const result = settle({ playedMs: 63 * MINUTE });
    expect(result.penaltyCents).toBe(0);
    expect(result.totalCents).toBe(600);
  });

  it('con un exceso de más de 3 minutos cobra la fracción de 15 minutos', () => {
    const result = settle({ playedMs: 64 * MINUTE });
    expect(result.extraMinutes).toBe(15);
    expect(result.totalCents).toBe(800);
    expect(result.penaltyCents).toBe(200);
  });

  it('en tiempo libre cobra el tiempo real jugado', () => {
    const result = settle({ durationMs: null, playedMs: 40 * MINUTE });
    expect(result.contractedMinutes).toBeNull();
    expect(result.extraMinutes).toBe(0);
    expect(result.penaltyCents).toBe(0);
    expect(result.totalCents).toBe(500);
  });
});
