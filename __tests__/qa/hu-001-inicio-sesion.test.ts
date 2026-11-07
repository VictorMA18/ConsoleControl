import {
  countOperationalControllers,
  getAvailableConsolesWithStock,
  getConsoleById,
} from '../../src/db/repositories/consoleRepository';
import { getRateBlocks } from '../../src/db/repositories/rateRepository';
import { openSession } from '../../src/db/repositories/sessionRepository';
import type { Console, RateBlock, Session } from '../../src/db/schema';
import { seedRates } from '../../src/db/seedData';
import { startSession } from '../../src/services/sessionService';

// Casos de docs/qa/casos-de-prueba.md. CP-001, CP-002 y CP-003 ya los cubre la lógica probada en
// __tests__/services/sessionService.test.ts; aquí va lo que falta.

jest.mock('../../src/db/repositories/consoleRepository', () => ({
  countOperationalControllers: jest.fn(),
  getAvailableConsolesWithStock: jest.fn(),
  getConsoleById: jest.fn(),
}));
jest.mock('../../src/db/repositories/rateRepository', () => ({ getRateBlocks: jest.fn() }));
jest.mock('../../src/db/repositories/sessionRepository', () => {
  class ConsoleNotAvailableError extends Error {}
  class InsufficientControllersError extends Error {}
  return { ConsoleNotAvailableError, InsufficientControllersError, openSession: jest.fn() };
});

const NOW = 1_760_000_000_000;

function consoleOf(consoleType: Console['consoleType']): Console {
  return {
    id: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    name: 'Consola de prueba',
    consoleType,
    status: 'disponible',
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: 'pendiente',
  };
}

function ratesOf(consoleType: Console['consoleType']): RateBlock[] {
  return seedRates
    .filter((rate) => rate.consoleType === consoleType)
    .map(({ blockMinutes, priceCents, extraControllerCents }) => ({
      blockMinutes,
      priceCents,
      extraControllerCents,
    }));
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(countOperationalControllers).mockResolvedValue(6);
  jest.mocked(getAvailableConsolesWithStock).mockResolvedValue([]);
  jest
    .mocked(openSession)
    .mockImplementation(async (input) => ({ ...input, id: 'sesion' }) as unknown as Session);
});

describe('CP-011 · sesión con 6 mandos (montos provisionales, D-05)', () => {
  it.each([
    ['ps4', 2200],
    ['xbox', 3250],
    ['ps5', 2830],
  ] as const)('CP-011 acepta 6 mandos en %s y estima %i céntimos', async (type, totalCents) => {
    const consoleRow = consoleOf(type);
    jest.mocked(getConsoleById).mockResolvedValue(consoleRow);
    jest.mocked(getRateBlocks).mockResolvedValue(ratesOf(type));

    const result = await startSession(
      { consoleId: consoleRow.id, controllerCount: 6, mode: 'fijo_60' },
      NOW,
    );

    expect(result.ok).toBe(true);
    expect(jest.mocked(openSession).mock.calls[0][0]).toMatchObject({
      controllerCount: 6,
      totalCents,
    });
  });

  it('CP-011 rechaza 7 mandos sin abrir la sesión', async () => {
    const result = await startSession(
      { consoleId: consoleOf('ps5').id, controllerCount: 7, mode: 'fijo_60' },
      NOW,
    );

    expect(result).toMatchObject({ ok: false, reason: 'datos_invalidos' });
    expect(openSession).not.toHaveBeenCalled();
  });
});

describe('CP-001 · partes sin prueba automática', () => {
  it.todo(
    'CP-001 consola "En Juego" y mandos descontados. Bloqueado: openSession usa la transacción ' +
      'de expo-sqlite y Jest no tiene un driver SQLite (ver revision-codigo.md)',
  );
  it.todo('CP-001 la operación toma máximo 2 toques. Bloqueado por T08');
});
