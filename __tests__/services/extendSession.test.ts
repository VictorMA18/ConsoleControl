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
    // PS3, 1 h contratada: 90 min = 60 + 30 → 5.00 + 2.50; 120 min = bloque de 2 h → 9.00;
    // 180 min = 120 + 60 → 9.00 + 5.00.
    [30, 90, 750],
    [60, 120, 900],
    [120, 180, 1400],
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

  it.each([15, 45])('rechaza un bloque de %i minutos (solo 30 min, 1 h o 2 h)', (minutes) => {
    expect(planExtension(session, minutes, START + 10 * MINUTE)).toMatchObject({
      ok: false,
      reason: 'bloque_invalido',
    });
  });

  it('rechaza una sesión en tiempo libre', () => {
    const free = { ...session, mode: 'libre' as const, durationMs: null, totalCents: 0 };

    expect(planExtension(free, 30, START + 10 * MINUTE)).toMatchObject({
      ok: false,
      reason: 'tiempo_libre',
    });
  });

  it('también extiende con el tiempo ya cumplido: sumar tiempo cubre el exceso', () => {
    // Contrató 1 h y va 1 h 10 min: con +30 min el vencimiento pasa a 1 h 30.
    expect(planExtension(session, 30, START + 70 * MINUTE)).toMatchObject({
      ok: true,
      endsAt: START + 90 * MINUTE,
    });
  });
});
