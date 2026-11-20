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

describe('calculateSettlement (HU-005) · tiempo fijo cobrado por tiempo jugado', () => {
  // Precio por hora con 1 mando: S/ 6.00. Regla de VN: hora × minutos jugados ÷ 60, redondeado
  // hacia arriba a S/ 0.10.
  it('si se corta antes, cobra solo lo jugado', () => {
    const result = settle({ playedMs: 20 * MINUTE });
    expect(result).toMatchObject({ playedMinutes: 20, chargedMinutes: 20, extraMinutes: 0 });
    expect(result.totalCents).toBe(200);
    expect(result.penaltyCents).toBe(0);
  });

  it('redondea hacia arriba a S/ 0.10, sin céntimos sueltos', () => {
    // 3 mandos: 6.00 + 2 × 1.00 = S/ 8.00 la hora; 37 min = 4.9333 → S/ 5.00.
    const result = settle({ controllerCount: 3, playedMs: 37 * MINUTE });
    expect(result.totalCents).toBe(500);
    expect(result.totalCents % 10).toBe(0);
  });

  it('un segundo más ya cuenta como minuto', () => {
    expect(settle({ playedMs: 30 * MINUTE + 1000 }).playedMinutes).toBe(31);
  });

  it.each([63, 65])(
    'con %i min (dentro de la tolerancia de 5) cobra solo lo contratado',
    (minutes) => {
      const result = settle({ playedMs: minutes * MINUTE });
      expect(result.extraMinutes).toBe(0);
      expect(result.penaltyCents).toBe(0);
      expect(result.totalCents).toBe(600);
    },
  );

  it('pasada la tolerancia cobra todos los minutos jugados a la misma tarifa', () => {
    // 1 h contratada y 1 h 8 min jugados: se cobran los 68 min (6.00 × 68 ÷ 60 = S/ 6.80).
    const result = settle({ playedMs: 68 * MINUTE });
    expect(result.extraMinutes).toBe(8);
    expect(result.baseCents).toBe(600);
    expect(result.penaltyCents).toBe(80);
    expect(result.totalCents).toBe(680);
  });
});

describe('calculateSettlement (HU-005) · tiempo libre', () => {
  it('cobra en bloques de 15 minutos con 3 de gracia', () => {
    const result = settle({ durationMs: null, playedMs: 40 * MINUTE });
    expect(result.contractedMinutes).toBeNull();
    expect(result.extraMinutes).toBe(0);
    expect(result.penaltyCents).toBe(0);
    expect(result.totalCents).toBe(500);
  });
});
