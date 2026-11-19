import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConsoleCard } from '../../src/components/ConsoleCard';
import type { ConsoleWithStock } from '../../src/services/consoleService';

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
    expect(screen.getByText(/PS5 · 6 mandos/)).toBeTruthy();
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
