import { View } from 'react-native';

import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { states: CardState[] };

// Los cuatro estados del resumen. "Por terminar" suma también las de tiempo cumplido: las dos piden
// atención pronto. Mantenimiento y averiadas no se cuentan arriba; se ven en su tarjeta.
// attention: cuando hay alguna, la tarjeta lleva el borde de su color para llamar la atención.
const TILES: { state: CardState; counts: CardState[]; attention?: string }[] = [
  { state: 'disponible', counts: ['disponible'] },
  { state: 'en_juego', counts: ['en_juego'] },
  {
    state: 'por_terminar',
    counts: ['por_terminar', 'tiempo_cumplido'],
    attention: 'border-warning',
  },
  { state: 'por_cobrar', counts: ['por_cobrar'], attention: 'border-pending' },
];

// Resumen del muro de un vistazo (ADR 0014): cuatro tarjetas en 2 × 2, con la etiqueta y su ícono
// de color arriba y el número grande abajo. Sin fondos de color ni barras; los ceros van en gris.
export function WallSummary({ states }: Props) {
  return (
    <View accessibilityRole="summary" className="flex-row flex-wrap justify-between gap-y-3">
      {TILES.map(({ state, counts, attention }) => {
        const style = CARD_STATE_STYLES[state];
        const total = states.filter((s) => counts.includes(s)).length;
        return (
          <View
            key={state}
            testID={`resumen-${state}`}
            accessibilityLabel={`${total} ${style.label}`}
            className={cn(
              'w-[48.5%] rounded-2xl border bg-card px-4 py-3',
              total > 0 && attention ? attention : 'border-border',
            )}
          >
            {/* El número va primero en el árbol (lectores de pantalla y pruebas leen «2 Disponible»)
                y se dibuja abajo con flex-col-reverse. */}
            <View className="flex-col-reverse gap-1.5">
              <Text
                className={cn(
                  'text-[26px] font-extrabold leading-8',
                  total === 0 && 'text-muted-foreground',
                )}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {total}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Icon as={STATE_ICONS[state]} size={14} strokeWidth={2.5} className={style.tone} />
                <Text numberOfLines={1} className="shrink text-xs font-bold text-muted-foreground">
                  {style.label}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
