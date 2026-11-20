import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './ui/text';

type Props = { title: string; trailing?: string; children: ReactNode; className?: string };

// Bloque de una pantalla: título en negrita y su contenido en una tarjeta de esquinas amplias.
export function Section({ title, trailing, children, className }: Props) {
  return (
    <View className={cn('gap-3 rounded-3xl border border-border bg-card p-5', className)}>
      <View className="flex-row items-center justify-between gap-3">
        <Text accessibilityRole="header" className="shrink text-base font-extrabold">
          {title}
        </Text>
        {trailing ? (
          <Text numberOfLines={1} className="shrink-0 text-sm font-semibold text-muted-foreground">
            {trailing}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
