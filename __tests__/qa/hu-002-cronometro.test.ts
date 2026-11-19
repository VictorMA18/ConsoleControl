import {
  type ActiveSession,
  getActiveSessionsWithConsole,
} from '../../src/db/repositories/sessionRepository';
import { listActiveSessions } from '../../src/services/sessionService';
import { elapsedMs, remainingMs } from '../../src/services/sessionTimer';
import { CARD_STATE_STYLES, cardState } from '../../src/utils/cardState';

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
    playedMinutes: null,
    chargedMinutes: null,
    penaltyCents: null,
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
  it.each([
    ['disponible', null, 'disponible', 'bg-available'],
    ['en_juego', 'en_curso', 'en_juego', 'bg-playing'],
    ['en_juego', 'libre', 'en_juego', 'bg-playing'],
    ['en_juego', 'proxima_a_vencer', 'por_terminar', 'bg-warning'],
    ['en_juego', 'tiempo_cumplido', 'tiempo_cumplido', 'bg-warning'],
  ] as const)('CP-006 consola %s con alerta %s se ve %s', (status, alert, state, band) => {
    expect(cardState(status, alert)).toBe(state);
    expect(CARD_STATE_STYLES[state].band).toBe(band);
  });
});
