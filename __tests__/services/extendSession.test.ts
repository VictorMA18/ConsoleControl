import { seedRates } from '../../src/db/seedData';
import { type ExtendableSession, planExtension } from '../../src/services/extension';

const MINUTE = 60_000;
const START = 1_760_000_000_000;

// PS3 con 1 mando y 1 hora contratada: S/ 5.00 (tarifario de T12).
const ps3Rates = seedRates
  .filter((r) => r.consoleType === 'ps3')
  .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
    blockMinutes,
    priceCents,
    extraControllerCents,
  }));

const session: ExtendableSession = {
  consoleType: 'ps3',
  controllerCount: 1,
  mode: 'fijo_60',
  status: 'activa',
  durationMs: 60 * MINUTE,
  startedAt: START,
  totalCents: 500,
  rateSnapshot: ps3Rates,
};

describe('HU-009 · extensión de tiempo', () => {
  it.each([
    // 75 min = 60 + 15 → S/ 5.00 + S/ 1.50; 90 min = 60 + 30 → S/ 5.00 + S/ 2.50.
    [15, 75, 650],
    [30, 90, 750],
  ])('añadir %i minutos mueve el vencimiento y recalcula el monto', (minutes, total, cents) => {
    const plan = planExtension(session, minutes, START + 40 * MINUTE);

    expect(plan).toEqual({
      ok: true,
      minutes,
      durationMs: total * MINUTE,
      endsAt: START + total * MINUTE,
      totalCents: cents,
    });
  });

  it('rechaza un bloque que no sea de 15 o 30 minutos', () => {
    const plan = planExtension(session, 20, START + 10 * MINUTE);

    expect(plan).toMatchObject({ ok: false, reason: 'bloque_invalido' });
  });

  it('rechaza una sesión en tiempo libre', () => {
    const free = { ...session, mode: 'libre' as const, durationMs: null, totalCents: 0 };

    expect(planExtension(free, 15, START + 10 * MINUTE)).toMatchObject({
      ok: false,
      reason: 'tiempo_libre',
    });
  });

  it('por defecto no extiende con el tiempo ya cumplido (por confirmar con VN)', () => {
    expect(planExtension(session, 15, START + 61 * MINUTE)).toMatchObject({
      ok: false,
      reason: 'tiempo_cumplido',
    });
  });
});
