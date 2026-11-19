import { View } from 'react-native';

import { CARD_STATE_ORDER, CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { Text } from './ui/text';

type Props = { states: CardState[] };

// Estados que se muestran siempre, aunque estén en cero; el resto solo cuando hay alguna consola.
const ALWAYS: CardState[] = ['disponible', 'en_juego'];

// Resumen del muro de un vistazo: cuántas consolas hay en cada estado.
export function WallSummary({ states }: Props) {
  const counts = CARD_STATE_ORDER.map((state) => ({
    state,
    total: states.filter((s) => s === state).length,
  })).filter(({ state, total }) => total > 0 || ALWAYS.includes(state));
  return (
    <View accessibilityRole="summary" className="flex-row flex-wrap gap-2">
      {counts.map(({ state, total }) => {
        const style = CARD_STATE_STYLES[state];
        return (
          <View
            key={state}
            testID={`resumen-${state}`}
            accessibilityLabel={`${total} ${style.label}`}
            className="min-w-[30%] grow gap-1 rounded-2xl border border-border bg-card px-3 py-3"
          >
            <Text className="text-3xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
              {total}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className={cn('h-2 w-2 rounded-full', style.band)} />
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {style.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
