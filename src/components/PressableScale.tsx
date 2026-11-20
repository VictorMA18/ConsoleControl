import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { EASE_OUT_BEZIER } from '../utils/theme';

// Al presionar, el elemento se hunde a 0.96 en 120 ms y vuelve al soltar (ADR 0014): la respuesta
// aparece al tocar, no al terminar el toque. Con movimiento reducido solo baja la opacidad.
const PRESS_TRANSITION = {
  transitionProperty: ['transform', 'opacity'] as ('transform' | 'opacity')[],
  transitionDuration: 120,
  transitionTimingFunction: cubicBezier(...EASE_OUT_BEZIER),
};

type Props = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  className?: string;
};

export function PressableScale({ children, className, onPressIn, onPressOut, ...props }: Props) {
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
    >
      <Animated.View
        className={className}
        style={[
          PRESS_TRANSITION,
          reducedMotion
            ? { opacity: pressed ? 0.85 : 1 }
            : { transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
