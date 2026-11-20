import { ArrowLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useInsets } from '../hooks/useBottomInset';
import { Logo } from './Logo';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  title?: string;
  subtitle?: string;
  // Muestra la marca en lugar del título (pantalla principal).
  logo?: boolean;
  // Flecha para volver a la pantalla anterior.
  onBack?: () => void;
  // Equis para cerrar un modal.
  onClose?: () => void;
  right?: ReactNode;
};

// Cabecera común de todas las pantallas: respeta la barra de estado y deja a un lado la acción de
// volver o cerrar. Reemplaza al encabezado nativo para que todas se vean igual.
export function ScreenHeader({ title, subtitle, logo, onBack, onClose, right }: Props) {
  const { top } = useInsets();
  return (
    <View
      className="flex-row items-center gap-3 border-b border-border bg-background px-4 pb-3"
      style={{ paddingTop: top + 12 }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full bg-secondary active:bg-accent"
        >
          <Icon as={ArrowLeft} size={22} />
        </Pressable>
      ) : null}
      <View className="flex-1">
        {logo ? (
          <Logo />
        ) : (
          <>
            <Text accessibilityRole="header" className="text-2xl font-extrabold tracking-tight">
              {title}
            </Text>
            {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
          </>
        )}
      </View>
      {right}
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onClose}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full bg-secondary active:bg-accent"
        >
          <Icon as={X} size={22} />
        </Pressable>
      ) : null}
    </View>
  );
}
