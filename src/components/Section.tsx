import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './ui/text';

type Props = { title: string; trailing?: string; children: ReactNode; className?: string };

// Bloque de una pantalla: título en mayúsculas pequeñas y su contenido en una tarjeta.
export function Section({ title, trailing, children, className }: Props) {
  return (
    <View className={cn('gap-3 rounded-3xl border border-border bg-card p-5', className)}>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </Text>
        {trailing ? <Text className="text-sm text-muted-foreground">{trailing}</Text> : null}
      </View>
      {children}
    </View>
  );
}
