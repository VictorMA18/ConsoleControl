import { act, renderHook } from '@testing-library/react-native';

import { useActiveSessions } from '../../src/hooks/useActiveSessions';
import { clockStore } from '../../src/hooks/useNow';
import { useSessionAlerts } from '../../src/hooks/useSessionAlerts';
import type { ActiveSession } from '../../src/services/sessionService';

jest.mock('../../src/hooks/useActiveSessions', () => ({ useActiveSessions: jest.fn() }));

const mockUseActiveSessions = jest.mocked(useActiveSessions);

const START = new Date('2026-10-28T15:00:00.000Z').getTime();
const MINUTE = 60 * 1000;

const session: ActiveSession = {
  id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
  consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
  consoleName: 'PS4 #1',
  consoleType: 'ps4',
  rateId: '0eb49c9b-ee8f-452f-bdae-fcd06227ae57',
  controllerCount: 1,
  mode: 'fijo_30',
  durationMs: 30 * MINUTE,
  startedAt: START,
  endedAt: null,
  status: 'activa',
  totalCents: 350,
  createdAt: START,
  updatedAt: START,
  syncStatus: 'pendiente',
};

beforeEach(() => {
  jest.useFakeTimers({ now: START });
  // El reloj compartido guarda la hora en que se cargó el módulo, antes del reloj simulado.
  // Suscribirse y soltarlo la actualiza a la hora simulada.
  clockStore.subscribe(() => {})();
  mockUseActiveSessions.mockReturnValue({ data: [session] } as ReturnType<
    typeof useActiveSessions
  >);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useSessionAlerts · reloj acelerado (TW-112)', () => {
  it('emite el aviso de 5 minutos y el de tiempo cumplido una sola vez cada uno', async () => {
    const onAlert = jest.fn();
    await renderHook(() => useSessionAlerts(onAlert));

    // Primeros 24 minutos: sin avisos.
    await act(async () => {
      jest.advanceTimersByTime(24 * MINUTE);
    });
    expect(onAlert).not.toHaveBeenCalled();

    // Minuto 25: faltan 5 minutos (RN-02).
    await act(async () => {
      jest.advanceTimersByTime(MINUTE);
    });
    expect(onAlert).toHaveBeenCalledTimes(1);
    expect(onAlert).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'proxima_a_vencer', consoleName: 'PS4 #1' }),
    );

    // Minutos 25 a 29: el aviso no se repite aunque el reloj siga avanzando.
    await act(async () => {
      jest.advanceTimersByTime(4 * MINUTE);
    });
    expect(onAlert).toHaveBeenCalledTimes(1);

    // Minuto 30: tiempo cumplido.
    await act(async () => {
      jest.advanceTimersByTime(MINUTE);
    });
    expect(onAlert).toHaveBeenCalledTimes(2);
    expect(onAlert).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'tiempo_cumplido', remainingMs: 0 }),
    );

    // Una hora después sigue en tiempo cumplido, sin más avisos.
    await act(async () => {
      jest.advanceTimersByTime(60 * MINUTE);
    });
    expect(onAlert).toHaveBeenCalledTimes(2);
  });

  it('no avisa mientras no hay sesiones cargadas', async () => {
    mockUseActiveSessions.mockReturnValue({ data: undefined } as ReturnType<
      typeof useActiveSessions
    >);
    const onAlert = jest.fn();
    await renderHook(() => useSessionAlerts(onAlert));

    await act(async () => {
      jest.advanceTimersByTime(40 * MINUTE);
    });
    expect(onAlert).not.toHaveBeenCalled();
  });
});
