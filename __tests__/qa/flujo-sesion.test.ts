import {
  countOperationalControllers,
  getConsoleById,
} from '../../src/db/repositories/consoleRepository';
import { getRateBlocks } from '../../src/db/repositories/rateRepository';
import {
  type ActiveSession,
  getActiveSessionsWithConsole,
  openSession,
} from '../../src/db/repositories/sessionRepository';
import type { Console, Session } from '../../src/db/schema';
import { seedRates } from '../../src/db/seedData';
import { createAlertTracker } from '../../src/services/sessionAlerts';
import { listActiveSessions, startSession } from '../../src/services/sessionService';
import { elapsedMs } from '../../src/services/sessionTimer';

// Flujo de docs/qa/prueba-integracion.md sin interfaz: inicio, cronómetro y alerta.

jest.mock('../../src/db/repositories/consoleRepository', () => ({
  countOperationalControllers: jest.fn(),
  getAvailableConsolesWithStock: jest.fn(),
  getConsoleById: jest.fn(),
}));
jest.mock('../../src/db/repositories/rateRepository', () => ({ getRateBlocks: jest.fn() }));
jest.mock('../../src/db/repositories/sessionRepository', () => {
  class ConsoleNotAvailableError extends Error {}
  class InsufficientControllersError extends Error {}
  return {
    ConsoleNotAvailableError,
    InsufficientControllersError,
    getActiveSessionsWithConsole: jest.fn(),
    openSession: jest.fn(),
  };
});

const MINUTE = 60_000;
const STARTED = 1_760_000_000_000;

const ps5: Console = {
  id: '551f976b-9f52-4e32-9db4-a2c938431f4f',
  name: 'PS5 #1',
  consoleType: 'ps5',
  status: 'disponible',
  createdAt: STARTED,
  updatedAt: STARTED,
  syncStatus: 'pendiente',
};

describe('flujo de sesión sin interfaz', () => {
  it('inicia, restaura, cuenta el tiempo y avisa una vez por estado', async () => {
    jest.mocked(getConsoleById).mockResolvedValue(ps5);
    jest.mocked(countOperationalControllers).mockResolvedValue(4);
    jest.mocked(getRateBlocks).mockResolvedValue(
      seedRates
        .filter((rate) => rate.consoleType === 'ps5')
        .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
          blockMinutes,
          priceCents,
          extraControllerCents,
        })),
    );
    jest.mocked(openSession).mockImplementation(
      async (input, now) =>
        ({
          ...input,
          id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
          startedAt: now,
          endedAt: null,
          status: 'activa',
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pendiente',
        }) as Session,
    );

    const started = await startSession(
      { consoleId: ps5.id, controllerCount: 1, mode: 'fijo_30' },
      STARTED,
    );
    if (!started.ok) {
      throw new Error(started.message);
    }

    const stored: ActiveSession = {
      ...started.session,
      consoleName: ps5.name,
      consoleType: ps5.consoleType,
    };
    jest.mocked(getActiveSessionsWithConsole).mockResolvedValue([stored]);
    const [session] = await listActiveSessions();
    const tracker = createAlertTracker();

    expect(elapsedMs(session, STARTED + 10 * MINUTE)).toBe(10 * MINUTE);
    expect(tracker.check([session], STARTED + 10 * MINUTE)).toEqual([]);
    expect(tracker.check([session], STARTED + 25 * MINUTE).map((a) => a.type)).toEqual([
      'proxima_a_vencer',
    ]);
    expect(tracker.check([session], STARTED + 26 * MINUTE)).toEqual([]);
    expect(tracker.check([session], STARTED + 30 * MINUTE).map((a) => a.type)).toEqual([
      'tiempo_cumplido',
    ]);
  });

  it.todo('flujo desde el muro de consolas. Bloqueado por T07');
  it.todo('flujo desde el diálogo de sesión. Bloqueado por T08');
});
