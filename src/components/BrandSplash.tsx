import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { BrandMark } from './BrandMark';
import { Text } from './ui/text';

// Cuánto se queda la marca a la vista antes de dar paso a la app.
const HOLD_MS = 900;

// ready: la base y la fuente están listas. Antes solo se ve el ícono (la fuente aún no cargó).
type Props = { ready: boolean; onDone: () => void };

// Pantalla de marca al abrir la app (ADR 0014). Continúa la pantalla de carga nativa: el ícono
// queda en el mismo lugar y del mismo tamaño (100 dp, centrado), así el paso no se nota; debajo
// aparece el nombre con un fundido y, al final, todo se desvanece hacia el muro.
export function BrandSplash({ ready, onDone }: Props) {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    const timer = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(timer);
  }, [ready, onDone]);
  const wordmarkEntering = reducedMotion
    ? FadeIn.duration(200)
    : FadeInDown.duration(320).delay(120);
  return (
    <Animated.View
      exiting={FadeOut.duration(260)}
      style={StyleSheet.absoluteFill}
      className="items-center justify-center bg-background"
      accessibilityLabel="ConsoleControl"
    >
      <BrandMark size={100} />
      {ready ? (
        <Animated.View entering={wordmarkEntering} style={styles.wordmark} className="items-center">
          <Text className="text-2xl font-extrabold tracking-tight">
            Console<Text className="text-2xl font-medium text-muted-foreground">Control</Text>
          </Text>
          <Text className="text-sm font-semibold text-muted-foreground">Panel del local</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// El nombre va debajo del ícono sin moverlo del centro de la pantalla.
const styles = StyleSheet.create({
  wordmark: { position: 'absolute', top: '50%', marginTop: 50 + 20 },
});
