import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SessionDialogScreen from '../../app/sesion/[consoleId]';
import type { Session } from '../../src/db/schema';
import { type ConsoleWithStock, listConsoles } from '../../src/services/consoleService';
import { listRateBlocks, startSession } from '../../src/services/sessionService';

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockConsoleId = '551f976b-9f52-4e32-9db4-a2c938431f4f';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ consoleId: mockConsoleId }),
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));
jest.mock('../../src/services/consoleService', () => ({ listConsoles: jest.fn() }));
jest.mock('../../src/services/sessionService', () => ({
  listActiveSessions: jest.fn(),
  listRateBlocks: jest.fn(),
  startSession: jest.fn(),
}));

const NOW = 1_760_000_000_000;

function consoleRow(overrides: Partial<ConsoleWithStock>): ConsoleWithStock {
  return {
    id: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    name: 'PS5 #1',
    consoleType: 'ps5',
    status: 'disponible',
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: 'pendiente',
    operationalControllers: 6,
    ...overrides,
  };
}

const ps4 = consoleRow({
  id: '9be9a615-3d18-4f92-a2fe-bfef68268278',
  name: 'PS4 #1',
  consoleType: 'ps4',
  operationalControllers: 4,
});

// Tarifario de PS5 de docs/architecture/tarifario.md.
const ps5Rates = [
  { blockMinutes: 15, priceCents: 250, extraControllerCents: 150 },
  { blockMinutes: 30, priceCents: 500, extraControllerCents: 250 },
  { blockMinutes: 45, priceCents: 750, extraControllerCents: 350 },
  { blockMinutes: 60, priceCents: 1000, extraControllerCents: 450 },
  { blockMinutes: 120, priceCents: 1900, extraControllerCents: 850 },
];

let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  mockConsoleId = '551f976b-9f52-4e32-9db4-a2c938431f4f';
  jest.mocked(listConsoles).mockResolvedValue([consoleRow({}), ps4]);
  jest.mocked(startSession).mockReset();
  jest.mocked(listRateBlocks).mockResolvedValue(ps5Rates);
  mockBack.mockClear();
  mockReplace.mockClear();
});

afterEach(() => client.clear());

async function renderDialog() {
  await render(
    <QueryClientProvider client={client}>
      <SessionDialogScreen />
    </QueryClientProvider>,
  );
}

describe('diálogo de sesión (T08)', () => {
  it('CP-001 inicia la sesión con 1 mando y 1 hora con un solo toque más', async () => {
    jest.mocked(startSession).mockResolvedValue({ ok: true, session: {} as Session });
    await renderDialog();

    await fireEvent.press(await screen.findByTestId('iniciar-sesion'));

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(startSession).toHaveBeenCalledWith({
      consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
      controllerCount: 1,
      mode: 'fijo_60',
    });
  });

  it('envía los mandos y la modalidad elegidos', async () => {
    jest.mocked(startSession).mockResolvedValue({ ok: true, session: {} as Session });
    await renderDialog();

    await fireEvent.press(await screen.findByTestId('mandos-3'));
    await fireEvent.press(screen.getByTestId('modalidad-libre'));
    await fireEvent.press(screen.getByTestId('iniciar-sesion'));

    await waitFor(() =>
      expect(startSession).toHaveBeenCalledWith(
        expect.objectContaining({ controllerCount: 3, mode: 'libre' }),
      ),
    );
  });

  it('CP-002 muestra el motivo y las consolas alternativas si faltan mandos', async () => {
    mockConsoleId = ps4.id;
    jest.mocked(startSession).mockResolvedValue({
      ok: false,
      reason: 'mandos_insuficientes',
      available: 4,
      alternatives: [consoleRow({})],
      message: 'PS4 #1 solo tiene 4 mandos operativos',
    });
    await renderDialog();

    await fireEvent.press(await screen.findByTestId('mandos-5'));
    await fireEvent.press(screen.getByTestId('iniciar-sesion'));

    expect(await screen.findByText('PS4 #1 solo tiene 4 mandos operativos')).toBeTruthy();
    await fireEvent.press(screen.getByText('PS5 #1 · 6 mandos libres'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/sesion/[consoleId]',
      params: { consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f' },
    });
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('CP-003 bloquea una consola en juego e informa el motivo', async () => {
    jest.mocked(listConsoles).mockResolvedValue([consoleRow({ status: 'en_juego' })]);
    await renderDialog();

    expect(await screen.findByText('PS5 #1 está en juego')).toBeTruthy();
    expect(screen.queryByTestId('iniciar-sesion')).toBeNull();
  });
});

describe('total estimado (T14)', () => {
  it('muestra el total del tarifario y lo actualiza al cambiar mandos y modalidad', async () => {
    await renderDialog();

    expect(await screen.findByText('S/ 10.00')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('mandos-6'));
    expect(screen.getByTestId('total-estimado')).toHaveTextContent('S/ 28.30');

    await fireEvent.press(screen.getByTestId('modalidad-fijo_120'));
    // 19.00 + 8.50 × 2 + 5.90 × 3 (30 % menos desde el 4.º mando en PS5).
    expect(screen.getByTestId('total-estimado')).toHaveTextContent('S/ 53.70');
  });

  it('en tiempo libre indica que el monto se calcula al cerrar', async () => {
    await renderDialog();

    await fireEvent.press(await screen.findByTestId('modalidad-libre'));

    expect(screen.getByText('Se calcula al cerrar')).toBeTruthy();
    expect(screen.queryByTestId('total-estimado')).toBeNull();
  });
});
