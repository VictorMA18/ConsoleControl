import { Coins } from 'lucide-react-native';
import { View } from 'react-native';

import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode } from '../db/schema/enums';
import { estimateTotalCents } from '../services/sessionQuote';
import { formatMoney } from '../utils/formatMoney';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  consoleType: ConsoleType;
  mode: SessionMode;
  controllerCount: number;
  rates: RateBlock[] | undefined;
};

// Total estimado del diálogo de sesión (HU-003, T14). Se recalcula en cada render con el motor
// de tarifas, sin consultar la base, así cambia al instante con los mandos o la modalidad.
export function EstimatedTotal({ consoleType, mode, controllerCount, rates }: Props) {
  const free = mode === 'libre';
  const total =
    rates && !free ? estimateTotalCents(consoleType, mode, controllerCount, rates) : null;
  return (
    <View className="flex-row items-center justify-between rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center gap-2">
        <Icon as={Coins} size={18} className="text-muted-foreground" />
        <Text className="text-base font-semibold text-muted-foreground">Total estimado</Text>
      </View>
      {free ? (
        <Text className="text-base font-medium text-muted-foreground">Se calcula al cerrar</Text>
      ) : (
        <Text testID="total-estimado" className="text-4xl font-extrabold tracking-tight">
          {total === null ? '—' : formatMoney(total)}
        </Text>
      )}
    </View>
  );
}
