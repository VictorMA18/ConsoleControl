import type { LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';

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
        className="flex-1 items-center justify-center bg-black/70 px-6"
      >
        <Pressable
          accessibilityViewIsModal
          onPress={() => undefined}
          className="w-full max-w-sm gap-5 rounded-3xl border border-border bg-card p-6"
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
      </Pressable>
    </Modal>
  );
}
