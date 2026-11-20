import { View } from 'react-native';

import type { HealthLight } from '../services/health';
import { cn } from '../utils/cn';
import { HEALTH_LOOK } from './HealthLightBadge';
import { Text } from './ui/text';

// Conteo de equipos (consolas y mandos) por color del semáforo, con el mismo lenguaje que el
// resumen del muro: tarjetas con la etiqueta y su punto de color arriba y el número abajo.
export function HealthOverview({ lights }: { lights: HealthLight[] }) {
  const columns: { light: HealthLight; label: string; a11y?: string }[] = [
    { light: 'verde', label: 'Operativos' },
    { light: 'ambar', label: 'Revisión', a11y: 'en mantenimiento' },
    { light: 'rojo', label: 'Averiados' },
  ];
  return (
    <View accessibilityRole="summary" className="flex-row gap-3">
      {columns.map((c) => {
        const total = lights.filter((l) => l === c.light).length;
        return (
          <View
            key={c.light}
            accessibilityLabel={`${total} ${c.a11y ?? c.label}`}
            className={cn(
              'flex-1 gap-3 rounded-2xl border bg-card px-4 py-3.5',
              total > 0 && c.light !== 'verde' ? 'border-warning' : 'border-border',
            )}
          >
            <View className="flex-row items-center gap-1.5">
              <View className={cn('h-2 w-2 rounded-full', HEALTH_LOOK[c.light].dot)} />
              <Text numberOfLines={1} className="shrink text-xs font-bold text-muted-foreground">
                {c.label}
              </Text>
            </View>
            <Text
              className={cn('text-3xl font-extrabold', total === 0 && 'text-muted-foreground')}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {total}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
