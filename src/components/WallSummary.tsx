import { View } from 'react-native';

import { CARD_STATE_ORDER, CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { states: CardState[] };

// Estados que se muestran siempre, aunque estén en cero; el resto solo cuando hay alguna consola.
const ALWAYS: CardState[] = ['disponible', 'en_juego'];

// Resumen del muro de un vistazo: cuántas consolas hay en cada estado. Cada ficha repite el
// lenguaje de la tarjeta: franja del color del estado, número grande e icono.
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
            className="min-w-[30%] grow overflow-hidden rounded-2xl border border-border bg-card"
          >
            <View className={cn('h-1.5', style.band)} />
            <View className="gap-1 px-3 pb-3 pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
                  {total}
                </Text>
                <Icon as={STATE_ICONS[state]} size={18} strokeWidth={2.25} className={style.tone} />
              </View>
              <Text className="text-xs font-bold text-muted-foreground">{style.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
