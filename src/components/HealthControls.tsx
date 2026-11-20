import { Pressable, View } from 'react-native';

import type { ConsoleStatus, ControllerStatus } from '../db/schema/enums';
import type { ConsoleHealthStatus, ControllerHealthStatus, HealthLight } from '../services/health';
import { cn } from '../utils/cn';
import { HEALTH_LOOK } from './HealthLightBadge';
import { Text } from './ui/text';

// Piezas del semáforo de salud (HU-012) que comparten la lista y el detalle de cada máquina.

export const CONSOLE_HEALTH_LABELS: Record<ConsoleStatus, string> = {
  disponible: 'Operativa',
  en_juego: 'En juego',
  mantenimiento: 'Mantenimiento',
  averiado: 'Averiada',
};

export const CONTROLLER_HEALTH_LABELS: Record<ControllerStatus, string> = {
  operativo: 'Operativo',
  en_uso: 'En uso',
  mantenimiento: 'Mantenimiento',
  averiado: 'Averiado',
};

const LIGHT_OF_OPTION: Record<ConsoleHealthStatus | ControllerHealthStatus, HealthLight> = {
  disponible: 'verde',
  operativo: 'verde',
  mantenimiento: 'ambar',
  averiado: 'rojo',
};

// Selector de estado: la opción elegida queda resaltada con el punto de su color.
export function HealthSegmented<T extends ConsoleHealthStatus | ControllerHealthStatus>({
  options,
  selected,
  disabled,
  onChange,
  compact,
  testID,
}: {
  options: { value: T; label: string }[];
  selected: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  compact?: boolean;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      className={cn('flex-row gap-1 rounded-2xl bg-secondary p-1', disabled && 'opacity-50')}
    >
      {options.map(({ value, label }) => {
        const active = value === selected;
        const look = HEALTH_LOOK[LIGHT_OF_OPTION[value]];
        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            onPress={() => onChange(value)}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl',
              compact ? 'h-10' : 'h-11',
              active ? 'bg-card' : 'active:bg-accent',
            )}
          >
            {active ? <View className={cn('h-2 w-2 rounded-full', look.dot)} /> : null}
            <Text
              numberOfLines={1}
              className={cn(
                compact ? 'text-xs' : 'text-sm',
                'font-bold',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
