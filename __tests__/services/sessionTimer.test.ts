import { elapsedMs, remainingMs, type TimedSession } from '../../src/services/sessionTimer';

const START = 1_760_000_000_000;
const MINUTE = 60 * 1000;

const fixed30: TimedSession = { startedAt: START, endedAt: null, durationMs: 30 * MINUTE };
const free: TimedSession = { startedAt: START, endedAt: null, durationMs: null };

describe('elapsedMs', () => {
  it('es 0 justo al iniciar', () => {
    expect(elapsedMs(fixed30, START)).toBe(0);
  });

  it('calcula el tiempo desde started_at sin depender de un contador', () => {
    expect(elapsedMs(fixed30, START + 12 * MINUTE + 345)).toBe(12 * MINUTE + 345);
  });

  it('incluye el tiempo que la app estuvo cerrada o el celular apagado', () => {
    // La app se cerró al minuto 2 y se reabrió al minuto 10: no hay contador que se reinicie.
    expect(elapsedMs(fixed30, START + 10 * MINUTE)).toBe(10 * MINUTE);
  });

  it('se detiene en ended_at cuando la sesión terminó', () => {
    const finished = { ...fixed30, endedAt: START + 25 * MINUTE };
    expect(elapsedMs(finished, START + 90 * MINUTE)).toBe(25 * MINUTE);
  });

  it('devuelve 0 si la hora del celular quedó antes de started_at', () => {
    expect(elapsedMs(fixed30, START - 5 * MINUTE)).toBe(0);
  });

  it('usa la hora actual si no se pasa una', () => {
    const justStarted = { ...free, startedAt: Date.now() };
    expect(elapsedMs(justStarted)).toBeLessThan(1000);
  });
});

describe('remainingMs', () => {
  it('descuenta el tiempo transcurrido de la duración contratada', () => {
    expect(remainingMs(fixed30, START + 25 * MINUTE)).toBe(5 * MINUTE);
  });

  it('no baja de 0 cuando el tiempo se cumplió', () => {
    expect(remainingMs(fixed30, START + 45 * MINUTE)).toBe(0);
  });

  it('es null en tiempo libre', () => {
    expect(remainingMs(free, START + 45 * MINUTE)).toBeNull();
  });
});
