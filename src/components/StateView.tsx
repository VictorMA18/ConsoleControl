import { CircleAlert, Gamepad2 } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { COLORS } from '../utils/theme';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { kind: 'loading' | 'error' | 'empty'; message?: string };

// Estado de una pantalla sin contenido: cargando, error o vacío. Un solo aspecto para todas.
export function StateView({ kind, message }: Props) {
  if (kind === 'loading') {
    return (
      <View accessibilityRole="progressbar" className="items-center gap-3 p-10">
        <ActivityIndicator size="large" color={COLORS.foreground} />
        {message ? <Text className="text-muted-foreground">{message}</Text> : null}
      </View>
    );
  }
  if (kind === 'error') {
    return (
      <View
        accessibilityRole="alert"
        className="m-4 flex-row items-center gap-3 rounded-2xl border border-playing/40 bg-playing-soft p-4"
      >
        <Icon as={CircleAlert} size={22} className="text-playing" />
        <Text className="flex-1 text-base font-semibold">{message ?? 'Ocurrió un error.'}</Text>
      </View>
    );
  }
  return (
    <View className="items-center gap-3 p-10">
      <Icon as={Gamepad2} size={28} className="text-muted-foreground" />
      <Text className="text-center text-base text-muted-foreground">
        {message ?? 'Sin resultados.'}
      </Text>
    </View>
  );
}
