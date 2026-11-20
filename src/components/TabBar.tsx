import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { cn } from '../utils/cn';
import { EASE_OUT_BEZIER, useThemeColors } from '../utils/theme';
import { Text } from './ui/text';

// La pastilla de la pestaña activa aparece estirándose desde el centro y desvaneciéndose (200 ms).
const PILL_TRANSITION = {
  transitionProperty: ['opacity', 'transform'] as ('opacity' | 'transform')[],
  transitionDuration: 200,
  transitionTimingFunction: cubicBezier(...EASE_OUT_BEZIER),
};

// Barra inferior al estilo Material 3 (ADR 0014): cada pestaña con su ícono dentro de una pastilla
// de 56 × 32 dp; la activa lleva la pastilla de color y la etiqueta en negrita. Suma el margen del
// sistema (barra de gestos o botones de Android) para no quedar debajo de él.
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  return (
    <View
      role="tablist"
      className="flex-row border-t border-border bg-card px-2 pt-2"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const color = focused ? colors.foreground : colors.mutedForeground;
        function onPress() {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        }
        return (
          <Pressable
            key={route.key}
            testID={`pestana-${route.name}`}
            role="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={onPress}
            className="flex-1 items-center gap-1"
          >
            <View className="h-8 w-14 items-center justify-center">
              <Animated.View
                className="absolute inset-0 rounded-full bg-secondary"
                style={[
                  PILL_TRANSITION,
                  {
                    opacity: focused ? 1 : 0,
                    transform: [{ scaleX: focused || reducedMotion ? 1 : 0.6 }],
                  },
                ]}
              />
              {options.tabBarIcon?.({ focused, color, size: 22 })}
            </View>
            <Text
              numberOfLines={1}
              className={cn(
                'text-xs',
                focused ? 'font-extrabold text-foreground' : 'font-semibold text-muted-foreground',
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
