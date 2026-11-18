import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';

// Parpadeo del ámbar "Por terminar" (HU-004, T16): solo la opacidad, en el hilo de UI.
const BLINK = {
  animationName: { from: { opacity: 1 }, to: { opacity: 0.35 } },
  animationDuration: '700ms',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
  animationTimingFunction: 'ease-in-out',
} as const;

type Props = { state: CardState; testID?: string };

// Franja superior de la tarjeta con el color y la etiqueta del estado. En "Por terminar" titila;
// en "Tiempo cumplido" el ámbar queda fijo (TW-115). Con movimiento reducido no titila: el color y
// la etiqueta ya indican el estado.
export function StatusBand({ state, testID }: Props) {
  const reducedMotion = useReducedMotion();
  const style = CARD_STATE_STYLES[state];
  const blinking = state === 'por_terminar' && !reducedMotion;
  return (
    <View testID={testID} className="relative px-4 py-2">
      <Animated.View
        testID={blinking ? 'ambar-titilante' : undefined}
        className={`absolute inset-0 ${style.band}`}
        style={blinking ? BLINK : undefined}
      />
      <Text className={`text-base font-bold ${style.text}`}>{style.label}</Text>
    </View>
  );
}
