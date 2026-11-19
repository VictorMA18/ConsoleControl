import { Pressable } from 'react-native';

import type { SessionAlert } from '../services/sessionAlerts';
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
      className="mx-4 mt-3 min-h-14 flex-row items-center justify-between rounded-xl bg-warning px-4"
    >
      <Text className="flex-1 text-lg font-bold text-warning-foreground">{message}</Text>
      <Text className="text-base font-semibold text-warning-foreground">Cerrar</Text>
    </Pressable>
  );
}
