import { ArrowLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useInsets } from '../hooks/useBottomInset';
import { BrandMark } from './BrandMark';
import { Logo } from './Logo';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  title?: string;
  // Línea pequeña de contexto bajo el título (por ejemplo, «Turno abierto desde 08:14»).
  subtitle?: string;
  // Muestra la marca en lugar del título (pantalla principal).
  logo?: boolean;
  // Flecha para volver a la pantalla anterior.
  onBack?: () => void;
  // Equis para cerrar un modal.
  onClose?: () => void;
  right?: ReactNode;
  // Elemento a la izquierda del título (por ejemplo, la pastilla de plataforma en Cobro). En las
  // pestañas, si no se pasa, va el ícono de la marca.
  accessory?: ReactNode;
};

// Cabecera común de todas las pantallas (ADR 0014): título grande y una línea de contexto, como
// los títulos amplios de iOS y Material 3. Respeta la barra de estado. Las pantallas de detalle
// llevan la flecha de volver en un botón circular de 44 dp; los modales, la equis a la derecha.
export function ScreenHeader({ title, subtitle, logo, onBack, onClose, right, accessory }: Props) {
  const { top } = useInsets();
  const detail = Boolean(onBack || onClose);
  return (
    <View className="bg-background px-4 pb-3" style={{ paddingTop: top + 10 }}>
      <View className="min-h-11 flex-row items-center gap-3">
        {onBack ? <RoundButton icon={ArrowLeft} label="Volver" onPress={onBack} /> : null}
        {logo ? null : (accessory ?? (detail ? null : <BrandMark size={40} />))}
        <View className="flex-1">
          {logo ? (
            <Logo />
          ) : (
            <>
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                className={
                  detail
                    ? 'text-xl font-extrabold tracking-tight'
                    : 'text-[28px] font-extrabold leading-9 tracking-tight'
                }
              >
                {title}
              </Text>
              {subtitle ? (
                <Text numberOfLines={1} className="text-sm font-semibold text-muted-foreground">
                  {subtitle}
                </Text>
              ) : null}
            </>
          )}
        </View>
        {right}
        {onClose ? <RoundButton icon={X} label="Cerrar" onPress={onClose} /> : null}
      </View>
    </View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
}: {
  icon: typeof ArrowLeft;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className="h-11 w-11 items-center justify-center rounded-full bg-secondary active:bg-accent"
    >
      <Icon as={icon} size={22} />
    </Pressable>
  );
}
