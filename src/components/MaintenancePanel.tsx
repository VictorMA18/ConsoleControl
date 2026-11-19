import { Sparkles, Thermometer, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import type { MaintenanceKind } from '../db/schema/enums';
import { formatUsage } from '../services/health';
import { MAINTENANCE_LABELS, type MaintenanceStatus } from '../services/maintenanceAlerts';
import { cn } from '../utils/cn';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

const KIND_ICONS: Record<MaintenanceKind, LucideIcon> = {
  limpieza: Sparkles,
  pasta_termica: Thermometer,
};

type Props = {
  statuses: MaintenanceStatus[];
  disabled?: boolean;
  onRegister: (status: MaintenanceStatus) => void;
};

// Mantenimiento preventivo de una consola (HU-014): por cada tipo, las horas desde la última
// intervención contra su umbral. Al alcanzarlo se marca en ámbar y pide registrar la intervención.
export function MaintenancePanel({ statuses, disabled, onRegister }: Props) {
  return (
    <View className="gap-3 border-t border-border pt-4">
      <Text className="text-sm font-bold text-muted-foreground">Mantenimiento preventivo</Text>
      {statuses.map((status) => {
        const progress = Math.min(1, status.minutesSince / status.thresholdMinutes);
        return (
          <View
            key={status.kind}
            testID={`mantenimiento-${status.consoleId}-${status.kind}`}
            className={cn('gap-2 rounded-2xl p-3', status.due ? 'bg-warning-soft' : 'bg-raised')}
          >
            <View className="flex-row items-center gap-2">
              <Icon
                as={KIND_ICONS[status.kind]}
                size={18}
                className={status.due ? 'text-warning-tone' : 'text-muted-foreground'}
              />
              <Text className={cn('flex-1 text-base font-bold', status.due && 'text-warning-tone')}>
                {MAINTENANCE_LABELS[status.kind]}
              </Text>
              <Text
                className="text-sm font-semibold text-muted-foreground"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatUsage(status.minutesSince)} / {status.thresholdMinutes / 60} h
              </Text>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <View
                className={cn('h-1.5 rounded-full', status.due ? 'bg-warning' : 'bg-foreground')}
                style={{ width: `${progress * 100}%` }}
              />
            </View>
            {status.due ? (
              <Button
                testID={`registrar-${status.consoleId}-${status.kind}`}
                variant="outline"
                disabled={disabled}
                onPress={() => onRegister(status)}
                className="h-11"
              >
                <Text className="text-sm font-bold">
                  Registrar {MAINTENANCE_LABELS[status.kind].toLowerCase()}
                </Text>
              </Button>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
