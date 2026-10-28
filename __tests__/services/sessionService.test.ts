import {
  countOperationalControllers,
  getAvailableConsolesWithStock,
  getConsoleById,
} from '../../src/db/repositories/consoleRepository';
import { getRateBlocks } from '../../src/db/repositories/rateRepository';
import { ConsoleNotAvailableError, openSession } from '../../src/db/repositories/sessionRepository';
import type { Console, RateBlock } from '../../src/db/schema';
import { startSession } from '../../src/services/sessionService';

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

const mockGetConsoleById = jest.mocked(getConsoleById);
const mockCountControllers = jest.mocked(countOperationalControllers);
const mockGetAvailable = jest.mocked(getAvailableConsolesWithStock);
const mockGetRateBlocks = jest.mocked(getRateBlocks);
const mockOpenSession = jest.mocked(openSession);

const NOW = 1_760_000_000_000;

const ps5: Console = {
  id: '551f976b-9f52-4e32-9db4-a2c938431f4f',
  name: 'PS5 #1',
  consoleType: 'ps5',
  status: 'disponible',
  createdAt: NOW,
  updatedAt: NOW,
  syncStatus: 'pendiente',
};

// Tarifario de PS5 del CSV de T12.
const ps5Rates: RateBlock[] = [
  { blockMinutes: 15, priceCents: 250, extraControllerCents: 150 },
  { blockMinutes: 30, priceCents: 500, extraControllerCents: 250 },
  { blockMinutes: 45, priceCents: 750, extraControllerCents: 350 },
  { blockMinutes: 60, priceCents: 1000, extraControllerCents: 450 },
  { blockMinutes: 120, priceCents: 1900, extraControllerCents: 850 },
];

const input = { consoleId: ps5.id, controllerCount: 2, mode: 'fijo_60' };

beforeEach(() => {
  jest.resetAllMocks();
  mockGetConsoleById.mockResolvedValue(ps5);
  mockCountControllers.mockResolvedValue(4);
  mockGetRateBlocks.mockResolvedValue(ps5Rates);
  mockOpenSession.mockImplementation(async (data, now = NOW) => ({
    ...data,
    id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
    durationMs: data.durationMs ?? null,
    startedAt: now,
    endedAt: null,
    status: 'activa',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pendiente',
  }));
});

describe('startSession · escenario 1: inicio exitoso', () => {
  it('crea la sesión con hora de inicio, modalidad, mandos y monto estimado', async () => {
    const result = await startSession(input, NOW);

    expect(result.ok).toBe(true);
    expect(mockOpenSession).toHaveBeenCalledWith(
      {
        consoleId: ps5.id,
        rateSnapshot: ps5Rates,
        controllerCount: 2,
        mode: 'fijo_60',
        durationMs: 60 * 60 * 1000,
        // 10.00 por 1 hora de PS5 + 4.50 por el segundo mando (RN-01).
        totalCents: 1450,
      },
      NOW,
    );
    if (result.ok) {
      expect(result.session.startedAt).toBe(NOW);
      expect(result.session.status).toBe('activa');
    }
  });

  it('en tiempo libre no fija duración ni monto al abrir', async () => {
    await startSession({ ...input, mode: 'libre' }, NOW);

    expect(mockOpenSession).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'libre', durationMs: null, totalCents: 0 }),
      NOW,
    );
  });
});

describe('startSession · escenario 2: mandos insuficientes', () => {
  it('no inicia la sesión y sugiere alternativas con stock, primero las del mismo tipo', async () => {
    mockCountControllers.mockResolvedValue(1);
    const ps4 = { ...ps5, id: 'ps4-id', name: 'PS4 #1', consoleType: 'ps4' as const };
    const otherPs5 = { ...ps5, id: 'ps5-2-id', name: 'PS5 #2' };
    const xbox = { ...ps5, id: 'xbox-id', name: 'Xbox #1', consoleType: 'xbox' as const };
    mockGetAvailable.mockResolvedValue([
      { ...ps4, operationalControllers: 4 },
      { ...ps5, operationalControllers: 1 },
      { ...otherPs5, operationalControllers: 3 },
      { ...xbox, operationalControllers: 1 },
    ]);

    const result = await startSession(input, NOW);

    expect(mockOpenSession).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: false, reason: 'mandos_insuficientes', available: 1 });
    if (!result.ok && result.reason === 'mandos_insuficientes') {
      expect(result.alternatives.map((c) => c.name)).toEqual(['PS5 #2', 'PS4 #1']);
    }
  });
});

describe('startSession · escenario 3: consola ocupada', () => {
  it.each([
    ['en_juego', 'PS5 #1 está en juego'],
    ['mantenimiento', 'PS5 #1 está en mantenimiento'],
  ] as const)('bloquea la asignación si la consola está %s', async (status, message) => {
    mockGetConsoleById.mockResolvedValue({ ...ps5, status });

    const result = await startSession(input, NOW);

    expect(mockOpenSession).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'consola_no_disponible', status, message });
  });

  it('informa el motivo si otro toque ocupó la consola durante la transacción', async () => {
    mockOpenSession.mockRejectedValueOnce(new ConsoleNotAvailableError());
    mockGetConsoleById
      .mockResolvedValueOnce(ps5)
      .mockResolvedValueOnce({ ...ps5, status: 'en_juego' });

    const result = await startSession(input, NOW);

    expect(result).toMatchObject({ ok: false, reason: 'consola_no_disponible' });
  });
});

describe('startSession · validación de datos', () => {
  it.each([
    { ...input, controllerCount: 0 },
    { ...input, controllerCount: 7 },
    { ...input, mode: 'fijo_45' },
    { ...input, consoleId: 'no-es-uuid' },
  ])('rechaza datos inválidos: %o', async (bad) => {
    const result = await startSession(bad, NOW);

    expect(result).toMatchObject({ ok: false, reason: 'datos_invalidos' });
    expect(mockGetConsoleById).not.toHaveBeenCalled();
  });
});
