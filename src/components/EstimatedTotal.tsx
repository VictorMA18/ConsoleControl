import { Text, View } from 'react-native';

import type { RateBlock } from '../db/schema';
import type { ConsoleType, SessionMode } from '../db/schema/enums';
import { estimateTotalCents } from '../services/sessionQuote';
import { formatMoney } from '../utils/formatMoney';

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
    <View className="flex-row items-center justify-between rounded-xl bg-canvas p-4">
      <Text className="text-lg font-bold text-ink">Total estimado</Text>
      {free ? (
        <Text className="text-base text-muted">Se calcula al cerrar</Text>
      ) : (
        <Text testID="total-estimado" className="text-3xl font-bold text-ink">
          {total === null ? '—' : formatMoney(total)}
        </Text>
      )}
    </View>
  );
}
