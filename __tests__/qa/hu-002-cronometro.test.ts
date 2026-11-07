import {
  type ActiveSession,
  getActiveSessionsWithConsole,
} from '../../src/db/repositories/sessionRepository';
import { listActiveSessions } from '../../src/services/sessionService';
import { elapsedMs, remainingMs } from '../../src/services/sessionTimer';

// Casos de docs/qa/casos-de-prueba.md. CP-004 ya lo cubre __tests__/services/sessionTimer.test.ts.

jest.mock('../../src/db/repositories/consoleRepository', () => ({}));
jest.mock('../../src/db/repositories/rateRepository', () => ({}));
jest.mock('../../src/db/repositories/sessionRepository', () => {
  class ConsoleNotAvailableError extends Error {}
  class InsufficientControllersError extends Error {}
  return {
    ConsoleNotAvailableError,
    InsufficientControllersError,
    getActiveSessionsWithConsole: jest.fn(),
  };
});

const MINUTE = 60_000;
const STARTED = 1_760_000_000_000;

function activeSession(overrides: Partial<ActiveSession>): ActiveSession {
  return {
    id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
    consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    consoleName: 'PS5 #1',
    consoleType: 'ps5',
    rateSnapshot: [],
    controllerCount: 2,
    mode: 'fijo_120',
    durationMs: 120 * MINUTE,
    startedAt: STARTED,
    endedAt: null,
    status: 'activa',
    totalCents: 0,
    createdAt: STARTED,
    updatedAt: STARTED,
    syncStatus: 'pendiente',
    ...overrides,
  };
}

describe('CP-005 · reinicio del teléfono', () => {
  it('CP-005 restaura cada sesión con el tiempo real, incluido el tiempo apagado', async () => {
    const fixed = activeSession({});
    const free = activeSession({
      id: '7f0e7d0a-3c4e-4f7e-9d59-2b6b2f1f3a10',
      consoleName: 'PS4 #1',
      consoleType: 'ps4',
      mode: 'libre',
      durationMs: null,
      startedAt: STARTED + 10 * MINUTE,
    });
    jest.mocked(getActiveSessionsWithConsole).mockResolvedValue([fixed, free]);

    // El celular estuvo apagado: al volver han pasado 45 minutos desde la primera sesión.
    const rebootedAt = STARTED + 45 * MINUTE;
    const restored = await listActiveSessions();

    expect(restored.map((session) => session.status)).toEqual(['activa', 'activa']);
    expect(restored.map((session) => elapsedMs(session, rebootedAt))).toEqual([
      45 * MINUTE,
      35 * MINUTE,
    ]);
    expect(restored.map((session) => remainingMs(session, rebootedAt))).toEqual([
      75 * MINUTE,
      null,
    ]);
  });

  it.todo('CP-005 reinicio real del teléfono. Manual en dispositivo (T18)');
});

describe('CP-006 · código cromático', () => {
  it.todo('CP-006 verde, rojo o ámbar según el estado. Bloqueado por T11');
});
