import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '../utils/cn';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  icon: LucideIcon;
  children: React.ReactNode;
  testID?: string;
  className?: string;
  // Dato secundario: se muestra atenuado.
  muted?: boolean;
};

// Fila de icono y dato de la tarjeta de consola (columna derecha) y de los resúmenes.
export function InfoRow({ icon, children, testID, className, muted }: Props) {
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Icon
        as={icon}
        size={20}
        strokeWidth={2.25}
        className={muted ? 'text-muted-foreground' : 'text-foreground'}
      />
      <Text
        testID={testID}
        numberOfLines={1}
        className={cn('text-[15px] font-bold', muted && 'text-muted-foreground')}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {children}
      </Text>
    </View>
  );
}
