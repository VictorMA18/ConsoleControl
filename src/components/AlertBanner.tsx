import { BellRing, TimerOff, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import type { SessionAlert } from '../services/sessionAlerts';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { alert: SessionAlert; onDismiss: () => void };

// Aviso visible de la última alerta (HU-004). Acompaña a la vibración, que no sirve sola: muchos
// celulares la tienen apagada. Entra bajando un poco con un fundido y sale con un fundido corto.
export function AlertBanner({ alert, onDismiss }: Props) {
  const ending = alert.type === 'proxima_a_vencer';
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(150)}
      className="mx-4 mt-3"
    >
      <Pressable
        testID="aviso-alerta"
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={
          ending
            ? `${alert.consoleName}: faltan 5 minutos o menos`
            : `${alert.consoleName}: tiempo cumplido`
        }
        accessibilityHint="Toca para cerrar el aviso"
        onPress={onDismiss}
        className="flex-row items-center gap-3 rounded-2xl bg-warning-soft py-2.5 pl-3 pr-4 active:opacity-80"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-warning">
          <Icon
            as={ending ? BellRing : TimerOff}
            size={20}
            strokeWidth={2.25}
            className="text-warning-foreground"
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-extrabold text-warning-tone">{alert.consoleName}</Text>
          <Text className="text-sm font-semibold text-warning-tone">
            {ending ? 'Faltan 5 minutos o menos' : 'Se cumplió el tiempo contratado'}
          </Text>
        </View>
        <Icon as={X} size={18} className="text-warning-tone" />
      </Pressable>
    </Animated.View>
  );
}
