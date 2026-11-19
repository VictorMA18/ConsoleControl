import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import ConsoleWallScreen from '../../app/index';
import { type ConsoleWithStock, listConsoles } from '../../src/services/consoleService';
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
    expect(screen.getAllByText('Disponible')).toHaveLength(2);
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
