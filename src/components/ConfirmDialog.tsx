import type { LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';
import Animated, { Easing, Keyframe, ReduceMotion } from 'react-native-reanimated';

import { EASE_OUT_BEZIER } from '../utils/theme';

import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  icon?: LucideIcon;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// La caja entra desde 0.96 con opacidad mientras el fondo hace el fundido nativo del Modal: crece
// un poco hacia su lugar en vez de aparecer de golpe (ADR 0014). Con movimiento reducido no escala.
const BOX_ENTERING = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.bezier(...EASE_OUT_BEZIER) },
})
  .duration(200)
  .reduceMotion(ReduceMotion.System);

// Diálogo de confirmación propio, con el aspecto de la app, en lugar del Alert del sistema. Tocar
// fuera o el botón atrás lo cierra sin confirmar.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  icon,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable
        accessibilityLabel="Cerrar diálogo"
        onPress={onCancel}
        className="flex-1 items-center justify-center bg-foreground/50 px-6"
      >
        <Animated.View entering={BOX_ENTERING} className="w-full max-w-sm">
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            className="gap-5 rounded-3xl border border-border bg-card p-6"
          >
            <View className="gap-3">
              {icon ? (
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                  <Icon as={icon} size={24} />
                </View>
              ) : null}
              <Text accessibilityRole="header" className="text-2xl font-extrabold tracking-tight">
                {title}
              </Text>
              <Text className="text-base leading-6 text-muted-foreground">{message}</Text>
            </View>
            <View className="flex-row gap-3">
              <Button variant="outline" onPress={onCancel} className="h-12 flex-1">
                <Text className="text-base">{cancelLabel}</Text>
              </Button>
              <Button testID="confirmar" onPress={onConfirm} className="h-12 flex-1">
                <Text className="text-base">{confirmLabel}</Text>
              </Button>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
