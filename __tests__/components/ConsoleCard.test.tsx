import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConsoleCard } from '../../src/components/ConsoleCard';
import type { ConsoleWithStock } from '../../src/services/consoleService';
import type { ActiveSession } from '../../src/services/sessionService';

jest.mock('../../src/services/sessionService', () => ({ listActiveSessions: jest.fn() }));

const NOW = 1_760_000_000_000;

const ps5: ConsoleWithStock = {
  id: '551f976b-9f52-4e32-9db4-a2c938431f4f',
  name: 'PS5 #1',
  consoleType: 'ps5',
  status: 'disponible',
  createdAt: NOW,
  updatedAt: NOW,
  syncStatus: 'pendiente',
  operationalControllers: 6,
};

describe('ConsoleCard', () => {
  it('muestra nombre, tipo, estado y mandos libres', async () => {
    await render(<ConsoleCard console={ps5} onPress={jest.fn()} />);

    expect(screen.getByText('PS5 #1')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.getByText('6 mandos libres')).toBeTruthy();
    expect(screen.getByLabelText('PS5, 6 mandos libres')).toBeTruthy();
  });

  it('indica el estado con texto además del color', async () => {
    await render(<ConsoleCard console={{ ...ps5, status: 'en_juego' }} onPress={jest.fn()} />);

    expect(screen.getByLabelText('PS5 #1, En juego')).toBeTruthy();
  });

  it('avisa qué consola se tocó', async () => {
    const onPress = jest.fn();
    await render(<ConsoleCard console={ps5} onPress={onPress} />);

    await fireEvent.press(screen.getByTestId(`console-card-${ps5.id}`));

    expect(onPress).toHaveBeenCalledWith(ps5);
  });
});

describe('ConsoleCard con sesión activa (T11)', () => {
  const MINUTE = 60_000;
  const session: ActiveSession = {
    id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
    consoleId: ps5.id,
    consoleName: 'PS5 #1',
    consoleType: 'ps5',
    rateSnapshot: [],
    controllerCount: 2,
    mode: 'fijo_30',
    durationMs: 30 * MINUTE,
    startedAt: NOW,
    endedAt: null,
    status: 'activa',
    totalCents: 750,
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: 'pendiente',
  };
  const playing = { ...ps5, status: 'en_juego' as const };

  beforeEach(() => jest.useFakeTimers({ now: NOW }));
  afterEach(() => jest.useRealTimers());

  it('TW-89 muestra el tiempo transcurrido y el restante, calculados desde started_at', async () => {
    jest.setSystemTime(NOW + 10 * MINUTE + 5_000);
    await render(<ConsoleCard console={playing} session={session} onPress={jest.fn()} />);

    expect(screen.getByTestId(`cronometro-${ps5.id}`)).toHaveTextContent('00:10:05');
    expect(screen.getByText('Quedan 00:19:55')).toBeTruthy();
    expect(screen.getByText('2 mandos')).toBeTruthy();
    expect(screen.getByLabelText('PS5 #1, En juego')).toBeTruthy();
  });

  it('CP-006 pasa a ámbar "Por terminar" con 5 minutos o menos', async () => {
    jest.setSystemTime(NOW + 25 * MINUTE);
    await render(<ConsoleCard console={playing} session={session} onPress={jest.fn()} />);

    expect(screen.getByText('Por terminar')).toBeTruthy();
  });

  it('CP-010 queda en "Tiempo cumplido" al agotarse el tiempo', async () => {
    jest.setSystemTime(NOW + 31 * MINUTE);
    await render(<ConsoleCard console={playing} session={session} onPress={jest.fn()} />);

    expect(screen.getByText('Tiempo cumplido')).toBeTruthy();
    expect(screen.getByText('Quedan 00:00:00')).toBeTruthy();
  });

  it('en tiempo libre muestra la modalidad en lugar del restante', async () => {
    jest.setSystemTime(NOW + 90 * MINUTE);
    await render(
      <ConsoleCard
        console={playing}
        session={{ ...session, mode: 'libre', durationMs: null }}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId(`cronometro-${ps5.id}`)).toHaveTextContent('01:30:00');
    expect(screen.getByText('Tiempo libre')).toBeTruthy();
    expect(screen.getByText('En juego')).toBeTruthy();
  });
});
