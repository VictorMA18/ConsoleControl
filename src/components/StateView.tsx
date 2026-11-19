import { ActivityIndicator, View } from 'react-native';

import { COLORS } from '../utils/theme';
import { Text } from './ui/text';

type Props = { kind: 'loading' | 'error' | 'empty'; message?: string };

// Estado de una pantalla sin contenido: cargando, error o vacío. Un solo aspecto para todas.
export function StateView({ kind, message }: Props) {
  if (kind === 'loading') {
    return (
      <View accessibilityRole="progressbar" className="items-center gap-3 p-8">
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message ? <Text className="text-muted-foreground">{message}</Text> : null}
      </View>
    );
  }
  if (kind === 'error') {
    return (
      <View accessibilityRole="alert" className="m-4 rounded-xl bg-playing-soft p-4">
        <Text className="text-lg font-bold">{message ?? 'Ocurrió un error.'}</Text>
      </View>
    );
  }
  return <Text className="p-4 text-lg text-muted-foreground">{message ?? 'Sin resultados.'}</Text>;
}
