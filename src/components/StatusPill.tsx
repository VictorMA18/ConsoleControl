import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Parpadeo del ámbar "Por terminar" (HU-004, T16): solo la opacidad, en el hilo de UI.
const BLINK = {
  animationName: { from: { opacity: 1 }, to: { opacity: 0.35 } },
  animationDuration: '700ms',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
  animationTimingFunction: 'ease-in-out',
} as const;

type Props = { state: CardState; testID?: string; className?: string };

// Etiqueta del estado de una consola: icono, texto y color. En "Por terminar" titila; en "Tiempo
// cumplido" el ámbar queda fijo (TW-115). Con movimiento reducido no titila: el icono, la etiqueta
// y el color ya indican el estado.
export function StatusPill({ state, testID, className }: Props) {
  const reducedMotion = useReducedMotion();
  const style = CARD_STATE_STYLES[state];
  const blinking = state === 'por_terminar' && !reducedMotion;
  return (
    <View testID={testID} className={cn('flex-row', className)}>
      <Animated.View
        testID={blinking ? 'ambar-titilante' : undefined}
        className={cn('flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5', style.soft)}
        style={blinking ? BLINK : undefined}
      >
        <Icon as={STATE_ICONS[state]} size={13} className={style.tone} />
        <Text className={cn('text-xs font-bold', style.tone)}>{style.label}</Text>
      </Animated.View>
    </View>
  );
}
