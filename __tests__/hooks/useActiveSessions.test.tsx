import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useActiveSessions } from '../../src/hooks/useActiveSessions';
import { type ActiveSession, listActiveSessions } from '../../src/services/sessionService';

jest.mock('../../src/services/sessionService', () => ({ listActiveSessions: jest.fn() }));

const mockListActiveSessions = jest.mocked(listActiveSessions);

const STARTED = 1_760_000_000_000;

const restored: ActiveSession = {
  id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
  consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
  consoleName: 'PS5 #1',
  consoleType: 'ps5',
  rateSnapshot: [{ blockMinutes: 60, priceCents: 1000, extraControllerCents: 450 }],
  controllerCount: 2,
  mode: 'fijo_60',
  durationMs: 60 * 60 * 1000,
  startedAt: STARTED,
  endedAt: null,
  status: 'activa',
  totalCents: 600,
  createdAt: STARTED,
  updatedAt: STARTED,
  syncStatus: 'pendiente',
};

let client: QueryClient;

beforeEach(() => {
  // gcTime infinito: sin temporizadores de limpieza que impidan que Jest termine.
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
});

afterEach(() => {
  client.clear();
});

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useActiveSessions', () => {
  it('restaura desde SQLite las sesiones activas con su hora de inicio original', async () => {
    mockListActiveSessions.mockResolvedValue([restored]);

    const { result } = await renderHook(() => useActiveSessions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([restored]);
    // La hora de inicio no cambia al restaurar: el tiempo se sigue calculando desde ella.
    expect(result.current.data?.[0].startedAt).toBe(STARTED);
  });

  it('devuelve una lista vacía si no hay sesiones activas', async () => {
    mockListActiveSessions.mockResolvedValue([]);

    const { result } = await renderHook(() => useActiveSessions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
