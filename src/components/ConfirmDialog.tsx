import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, Keyframe, ReduceMotion } from 'react-native-reanimated';

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

// Al abrir, el fondo aparece con un fundido y la caja crece desde 0.96; al cerrar, la caja se
// encoge un poco mientras se desvanece, más rápido que al entrar (ADR 0014). Con movimiento
// reducido no escala: solo cambia la opacidad.
const ENTER_MS = 200;
const EXIT_MS = 150;

const BOX_ENTERING = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.bezier(...EASE_OUT_BEZIER) },
})
  .duration(ENTER_MS)
  .reduceMotion(ReduceMotion.System);

const BOX_EXITING = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.97 }], easing: Easing.bezier(...EASE_OUT_BEZIER) },
})
  .duration(EXIT_MS)
  .reduceMotion(ReduceMotion.System);

type Content = Pick<Props, 'title' | 'message' | 'confirmLabel' | 'icon' | 'cancelLabel'>;

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
  // El Modal nativo desaparece de golpe al ocultarlo: se mantiene montado mientras corre la
  // animación de salida, con el último contenido (quien lo abre suele borrar el título al cerrar).
  const [mounted, setMounted] = useState(visible);
  const [wasVisible, setWasVisible] = useState(visible);
  const [shown, setShown] = useState<Content>({ title, message, confirmLabel, icon, cancelLabel });
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setMounted(true);
    }
  }
  if (
    visible &&
    (shown.title !== title ||
      shown.message !== message ||
      shown.confirmLabel !== confirmLabel ||
      shown.icon !== icon ||
      shown.cancelLabel !== cancelLabel)
  ) {
    setShown({ title, message, confirmLabel, icon, cancelLabel });
  }
  useEffect(() => {
    if (visible) {
      return undefined;
    }
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      visible={mounted}
      onRequestClose={onCancel}
    >
      {visible ? (
        <Animated.View
          entering={FadeIn.duration(ENTER_MS)}
          exiting={FadeOut.duration(EXIT_MS)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            accessibilityLabel="Cerrar diálogo"
            onPress={onCancel}
            className="flex-1 items-center justify-center bg-foreground/50 px-6"
          >
            <Animated.View
              entering={BOX_ENTERING}
              exiting={BOX_EXITING}
              className="w-full max-w-sm"
            >
              <Pressable
                accessibilityViewIsModal
                onPress={() => undefined}
                className="gap-5 rounded-3xl border border-border bg-card p-6"
              >
                <View className="gap-3">
                  {shown.icon ? (
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                      <Icon as={shown.icon} size={24} />
                    </View>
                  ) : null}
                  <Text
                    accessibilityRole="header"
                    className="text-2xl font-extrabold tracking-tight"
                  >
                    {shown.title}
                  </Text>
                  <Text className="text-base leading-6 text-muted-foreground">{shown.message}</Text>
                </View>
                <View className="flex-row gap-3">
                  <Button variant="outline" onPress={onCancel} className="h-12 flex-1">
                    <Text className="text-base">{shown.cancelLabel ?? 'Cancelar'}</Text>
                  </Button>
                  <Button testID="confirmar" onPress={onConfirm} className="h-12 flex-1">
                    <Text className="text-base">{shown.confirmLabel}</Text>
                  </Button>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      ) : null}
    </Modal>
  );
}
