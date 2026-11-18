import { render, screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { StatusBand } from '../../src/components/StatusBand';

describe('StatusBand (T16)', () => {
  afterEach(() => jest.mocked(useReducedMotion).mockReturnValue(false));

  it('CP-009 titila en ámbar cuando la sesión está por terminar', async () => {
    await render(<StatusBand state="por_terminar" />);

    expect(screen.getByText('Por terminar')).toBeTruthy();
    expect(screen.getByTestId('ambar-titilante')).toBeTruthy();
  });

  it('TW-115 mantiene el ámbar fijo en "Tiempo cumplido"', async () => {
    await render(<StatusBand state="tiempo_cumplido" />);

    expect(screen.getByText('Tiempo cumplido')).toBeTruthy();
    expect(screen.queryByTestId('ambar-titilante')).toBeNull();
  });

  it('con movimiento reducido no titila, pero conserva el color y la etiqueta', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    await render(<StatusBand state="por_terminar" />);

    expect(screen.getByText('Por terminar')).toBeTruthy();
    expect(screen.queryByTestId('ambar-titilante')).toBeNull();
  });
});
