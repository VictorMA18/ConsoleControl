import { View } from 'react-native';

import type { HealthLight } from '../services/health';
import { cn } from '../utils/cn';
import { Text } from './ui/text';

// Colores del semáforo: verde operativo, ámbar mantenimiento y rojo averiado (HU-012). Siempre con
// texto además del color.
export const HEALTH_LOOK: Record<HealthLight, { dot: string; soft: string; tone: string }> = {
  verde: { dot: 'bg-available-tone', soft: 'bg-available-soft', tone: 'text-available-tone' },
  ambar: { dot: 'bg-warning', soft: 'bg-warning-soft', tone: 'text-warning-tone' },
  rojo: { dot: 'bg-destructive', soft: 'bg-playing-soft', tone: 'text-destructive' },
};

// playing: la consola está en juego. Sigue siendo operativa en el semáforo, pero se distingue con
// el color de juego del muro para no confundirla con una libre.
type Props = { light: HealthLight; label: string; testID?: string; playing?: boolean };

const PLAYING_LOOK = { dot: 'bg-playing', soft: 'bg-playing-soft', tone: 'text-playing-tone' };

export function HealthLightBadge({ light, label, testID, playing }: Props) {
  const look = playing ? PLAYING_LOOK : HEALTH_LOOK[light];
  return (
    <View
      testID={testID}
      className={cn('flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1', look.soft)}
    >
      <View className={cn('h-2 w-2 rounded-full', look.dot)} />
      <Text className={cn('text-xs font-bold', look.tone)}>{label}</Text>
    </View>
  );
}
