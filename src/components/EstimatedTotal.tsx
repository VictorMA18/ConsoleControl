import { Coins } from 'lucide-react-native';
import { View } from 'react-native';

import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode } from '../db/schema/enums';
import { quoteBreakdown } from '../services/sessionQuote';
import { formatMoney } from '../utils/formatMoney';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  consoleType: ConsoleType;
  mode: SessionMode;
  controllerCount: number;
  rates: RateBlock[] | undefined;
};

// Total estimado del diálogo de sesión (HU-003, T14), con su desglose para que se pueda verificar
// a la vista: consola + extra por mando desde el 2.º, con el descuento de grupo si aplica. Se
// recalcula en cada render con el motor de tarifas, sin consultar la base.
export function EstimatedTotal({ consoleType, mode, controllerCount, rates }: Props) {
  const free = mode === 'libre';
  const breakdown =
    rates && !free ? quoteBreakdown(consoleType, mode, controllerCount, rates) : null;
  return (
    <View className="gap-4 rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon as={Coins} size={18} className="text-muted-foreground" />
          <Text className="text-base font-semibold text-muted-foreground">Total estimado</Text>
        </View>
        {free ? (
          <Text className="text-base font-medium text-muted-foreground">Se calcula al cerrar</Text>
        ) : (
          <Text
            testID="total-estimado"
            className="text-4xl font-extrabold tracking-tight"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {breakdown ? formatMoney(breakdown.totalCents) : '—'}
          </Text>
        )}
      </View>
      {breakdown ? (
        <View testID="desglose" className="gap-1.5 border-t border-border pt-3">
          <Line label="Consola (1 mando)" cents={breakdown.baseCents} />
          {breakdown.regular.count > 0 ? (
            <Line
              label={`${breakdown.regular.count} × mando extra de ${formatMoney(breakdown.regular.unitCents)}`}
              cents={breakdown.regular.count * breakdown.regular.unitCents}
            />
          ) : null}
          {breakdown.discounted.count > 0 ? (
            <Line
              label={`${breakdown.discounted.count} × desde el 4.º, −30 % (${formatMoney(breakdown.discounted.unitCents)})`}
              cents={breakdown.discounted.count * breakdown.discounted.unitCents}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Line({ label, cents }: { label: string; cents: number }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-bold" style={{ fontVariant: ['tabular-nums'] }}>
        {formatMoney(cents)}
      </Text>
    </View>
  );
}
