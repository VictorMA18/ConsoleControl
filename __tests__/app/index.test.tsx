import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Vibration } from 'react-native';

import ConsoleWallScreen from '../../app/(tabs)/index';
import { type ConsoleWithStock, listConsoles } from '../../src/services/consoleService';
import {
  type ActiveSession,
  listActiveSessions,
  listPendingSessions,
} from '../../src/services/sessionService';
import { useWallFilterStore } from '../../src/stores/wallFilterStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: ReactNode }) => {
    const { Text } = jest.requireActual('react-native');
    return <Text>{children}</Text>;
  },
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('../../src/services/consoleService', () => ({ listConsoles: jest.fn() }));
jest.mock('../../src/services/sessionService', () => ({
  listActiveSessions: jest.fn(),
  listPendingSessions: jest.fn(),
}));

const NOW = 1_760_000_000_000;

function consoleRow(id: string, name: string, consoleType: ConsoleWithStock['consoleType']) {
  return {
    id,
    name,
    consoleType,
    status: 'disponible',
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: 'pendiente',
    operationalControllers: 4,
  } satisfies ConsoleWithStock;
}

const inventory = [
  consoleRow('9be9a615-3d18-4f92-a2fe-bfef68268278', 'PS4 #1', 'ps4'),
  consoleRow('551f976b-9f52-4e32-9db4-a2c938431f4f', 'PS5 #1', 'ps5'),
];

let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  jest.mocked(listConsoles).mockResolvedValue(inventory);
  jest.mocked(listActiveSessions).mockResolvedValue([]);
  jest.mocked(listPendingSessions).mockResolvedValue([]);
  useWallFilterStore.setState({ consoleType: null });
  mockPush.mockClear();
});

afterEach(() => client.clear());

async function renderWall() {
  await render(
    <QueryClientProvider client={client}>
      <ConsoleWallScreen />
    </QueryClientProvider>,
  );
  await screen.findByText('PS4 #1');
}

describe('muro de consolas (T07)', () => {
  it('muestra todas las consolas del inventario con su estado', async () => {
    await renderWall();

    expect(screen.getByText('PS5 #1')).toBeTruthy();
    expect(screen.getAllByTestId(/^estado-/)).toHaveLength(2);
    expect(screen.getByTestId('resumen-disponible')).toHaveTextContent('2Disponible');
  });

  it('filtra por tipo de consola', async () => {
    await renderWall();

    await fireEvent.press(screen.getByText('PS5'));

    expect(screen.queryByText('PS4 #1')).toBeNull();
    expect(screen.getByText('PS5 #1')).toBeTruthy();
  });

  it('al tocar una consola abre su diálogo de sesión', async () => {
    await renderWall();

    await fireEvent.press(screen.getByText('PS5 #1'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/sesion/[consoleId]',
      params: { consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f' },
    });
  });
});

describe('muro con varias sesiones (T11, TW-93)', () => {
  it('muestra un cronómetro por consola con 4 sesiones simultáneas', async () => {
    const ids = [
      '9be9a615-3d18-4f92-a2fe-bfef68268278',
      '551f976b-9f52-4e32-9db4-a2c938431f4f',
      '95bce93b-3e0a-401d-b7a6-65ae769ece61',
      'fb64a232-3044-4929-99c9-8a0c7203cdac',
    ];
    const busy = ids.map((id, i) => ({
      ...consoleRow(id, `Consola ${i + 1}`, 'ps4'),
      status: 'en_juego' as const,
    }));
    const sessions = ids.map((consoleId, i): ActiveSession => ({
      id: `sesion-${i}`,
      consoleId,
      consoleName: `Consola ${i + 1}`,
      consoleType: 'ps4',
      rateSnapshot: [],
      controllerCount: 1,
      mode: 'libre',
      durationMs: null,
      startedAt: Date.now() - (i + 1) * 60_000,
      endedAt: null,
      status: 'activa',
      totalCents: 0,
      playedMinutes: null,
      chargedMinutes: null,
      penaltyCents: null,
      createdAt: NOW,
      updatedAt: NOW,
      syncStatus: 'pendiente',
    }));
    jest.mocked(listConsoles).mockResolvedValue(busy);
    jest.mocked(listActiveSessions).mockResolvedValue(sessions);

    await render(
      <QueryClientProvider client={client}>
        <ConsoleWallScreen />
      </QueryClientProvider>,
    );

    for (const id of ids) {
      expect(await screen.findByTestId(`cronometro-${id}`)).toBeTruthy();
    }
    expect(screen.getAllByTestId(/^estado-/)).toHaveLength(4);
    expect(screen.getByTestId('resumen-en_juego')).toHaveTextContent('4En juego');
  });
});

describe('alerta de vencimiento en el muro (T16)', () => {
  const MINUTE = 60_000;

  beforeEach(() => jest.useFakeTimers({ now: NOW }));
  afterEach(() => jest.useRealTimers());

  it('CP-009 vibra una vez y muestra el aviso cuando faltan 5 minutos', async () => {
    const vibrate = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    const ps5 = { ...inventory[1], status: 'en_juego' as const };
    jest.mocked(listConsoles).mockResolvedValue([inventory[0], ps5]);
    jest.mocked(listActiveSessions).mockResolvedValue([
      {
        id: 'sesion-ps5',
        consoleId: ps5.id,
        consoleName: 'PS5 #1',
        consoleType: 'ps5',
        rateSnapshot: [],
        controllerCount: 1,
        mode: 'fijo_30',
        durationMs: 30 * MINUTE,
        startedAt: NOW - 24 * MINUTE,
        endedAt: null,
        status: 'activa',
        totalCents: 500,
        playedMinutes: null,
        chargedMinutes: null,
        penaltyCents: null,
        createdAt: NOW,
        updatedAt: NOW,
        syncStatus: 'pendiente',
      },
    ]);
    await render(
      <QueryClientProvider client={client}>
        <ConsoleWallScreen />
      </QueryClientProvider>,
    );
    await screen.findByText('PS5 #1');
    expect(vibrate).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(MINUTE + 1_000);
    });

    expect(screen.getByText('PS5 #1: faltan 5 minutos o menos')).toBeTruthy();
    expect(screen.getByTestId('ambar-titilante')).toBeTruthy();
    expect(screen.getByTestId('resumen-por_terminar')).toHaveTextContent('1Por terminar');
    expect(vibrate).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(vibrate).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId('aviso-alerta'));
    expect(screen.queryByTestId('aviso-alerta')).toBeNull();
  });
});
