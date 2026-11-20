import { render, screen } from '@testing-library/react-native';

import { WallSummary } from '../../src/components/WallSummary';

// Conteos de la pestaña Resumen (antes estaban en el muro).
describe('WallSummary', () => {
  it('cuenta las consolas disponibles y en juego', async () => {
    await render(
      <WallSummary
        states={['disponible', 'disponible', 'en_juego', 'en_juego', 'en_juego', 'en_juego']}
      />,
    );

    expect(screen.getByTestId('resumen-disponible')).toHaveTextContent('2Disponible');
    expect(screen.getByTestId('resumen-en_juego')).toHaveTextContent('4En juego');
  });

  it('«Por terminar» suma también las de tiempo cumplido', async () => {
    await render(<WallSummary states={['por_terminar', 'tiempo_cumplido', 'por_cobrar']} />);

    expect(screen.getByTestId('resumen-por_terminar')).toHaveTextContent('2Por terminar');
    expect(screen.getByTestId('resumen-por_cobrar')).toHaveTextContent('1Por cobrar');
  });
});
