import { BellRing, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { SessionAlert } from '../services/sessionAlerts';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = { alert: SessionAlert; onDismiss: () => void };

// Aviso visible de la última alerta (HU-004). Acompaña a la vibración, que no sirve sola: muchos
// celulares la tienen apagada.
export function AlertBanner({ alert, onDismiss }: Props) {
  const message =
    alert.type === 'proxima_a_vencer'
      ? `${alert.consoleName}: faltan 5 minutos o menos`
      : `${alert.consoleName}: tiempo cumplido`;
  return (
    <Pressable
      testID="aviso-alerta"
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityHint="Toca para cerrar el aviso"
      onPress={onDismiss}
      className="mx-4 mt-3 flex-row items-center gap-3 rounded-2xl border border-warning/60 bg-warning-soft px-4 py-3 active:opacity-80"
    >
      <Icon as={BellRing} size={22} className="text-warning-tone" />
      <View className="flex-1">
        <Text className="text-base font-bold text-warning-tone">{message}</Text>
      </View>
      <Icon as={X} size={18} className="text-warning-tone" />
    </Pressable>
  );
}
