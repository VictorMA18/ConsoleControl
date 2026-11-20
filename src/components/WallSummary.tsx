import { View } from 'react-native';

import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { states: CardState[] };

// Las cuatro fichas del resumen. "Por terminar" suma también las de tiempo cumplido: las dos piden
// atención pronto. Mantenimiento no se cuenta arriba; se ve en su tarjeta.
const TILES: { state: CardState; counts: CardState[] }[] = [
  { state: 'disponible', counts: ['disponible'] },
  { state: 'en_juego', counts: ['en_juego'] },
  { state: 'por_terminar', counts: ['por_terminar', 'tiempo_cumplido'] },
  { state: 'por_cobrar', counts: ['por_cobrar'] },
];

// Resumen del muro de un vistazo: cuadrícula de 2 × 2 con cuántas consolas hay en cada estado. El
// color va solo en el icono (sobre un fondo suave del mismo tono), sin franjas.
export function WallSummary({ states }: Props) {
  return (
    <View accessibilityRole="summary" className="flex-row flex-wrap justify-between gap-y-3">
      {TILES.map(({ state, counts }) => {
        const style = CARD_STATE_STYLES[state];
        const total = states.filter((s) => counts.includes(s)).length;
        return (
          <View
            key={state}
            testID={`resumen-${state}`}
            accessibilityLabel={`${total} ${style.label}`}
            className="w-[48.5%] flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <View className={cn('h-11 w-11 items-center justify-center rounded-xl', style.soft)}>
              <Icon as={STATE_ICONS[state]} size={22} strokeWidth={2.25} className={style.tone} />
            </View>
            <View className="flex-1">
              <Text
                className="text-2xl font-extrabold leading-7"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {total}
              </Text>
              <Text numberOfLines={1} className="text-xs font-bold text-muted-foreground">
                {style.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
