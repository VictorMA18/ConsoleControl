import { Clock, Gamepad2, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import type { Settlement } from '../services/settlement';
import { CARD_STATE_STYLES, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { formatMoney } from '../utils/formatMoney';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Estado de la sesión que pinta la franja: en juego, por cobrar o ya cobrada (disponible).
type Props = { settlement: Settlement; state?: CardState };

function Row({
  icon,
  label,
  value,
  testID,
  warn,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  testID?: string;
  warn?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2.5">
        <Icon
          as={icon}
          size={18}
          className={warn ? 'text-warning-tone' : 'text-muted-foreground'}
        />
        <Text className={cn('text-base', warn ? 'text-warning-tone' : 'text-muted-foreground')}>
          {label}
        </Text>
      </View>
      <Text
        testID={testID}
        className={cn('text-xl font-bold', warn && 'text-warning-tone')}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}

// Resumen de cobro de una sesión (HU-005): el total en grande y debajo minutos jugados, mandos y
// penalidad, para leerlos de un vistazo. Lleva la franja de estado de la tarjeta de consola.
export function SettlementSummary({ settlement, state = 'por_cobrar' }: Props) {
  const style = CARD_STATE_STYLES[state];
  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-card">
      <View className={cn('flex-row items-center gap-2 px-5 py-3', style.band)}>
        <Icon as={STATE_ICONS[state]} size={20} strokeWidth={2.5} className={style.onBand} />
        <Text className={cn('text-xl font-extrabold', style.onBand)}>{style.label}</Text>
      </View>
      <View className="gap-1 p-5">
        <Text className="text-sm font-bold text-muted-foreground">Total a cobrar</Text>
        <Text
          testID="total-cobro"
          className="text-6xl font-extrabold tracking-tight"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatMoney(settlement.totalCents)}
        </Text>
      </View>
      <View className="gap-4 border-t border-border bg-raised p-5">
        <Row
          icon={Clock}
          label="Minutos jugados"
          value={`${settlement.playedMinutes} min`}
          testID="minutos-jugados"
        />
        <Row
          icon={Gamepad2}
          label="Mandos"
          value={String(settlement.controllerCount)}
          testID="mandos-utilizados"
        />
        {settlement.penaltyCents > 0 ? (
          <Row
            warn
            icon={TriangleAlert}
            label={`Exceso (${settlement.extraMinutes} min)`}
            value={formatMoney(settlement.penaltyCents)}
            testID="penalidad"
          />
        ) : null}
      </View>
    </View>
  );
}
