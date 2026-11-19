import { View } from 'react-native';

import type { Settlement } from '../services/settlement';
import { formatMoney } from '../utils/formatMoney';
import { Card } from './ui/card';
import { Text } from './ui/text';

type Props = { settlement: Settlement };

function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-lg text-muted-foreground">{label}</Text>
      <Text testID={testID} className="text-xl font-bold" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}

// Resumen de cobro de una sesión (HU-005): minutos jugados, mandos, penalidad y total en soles,
// con números grandes para leerlos de un vistazo.
export function SettlementSummary({ settlement }: Props) {
  return (
    <Card className="gap-4 px-4 py-5">
      <Row
        label="Minutos jugados"
        value={`${settlement.playedMinutes} min`}
        testID="minutos-jugados"
      />
      <Row label="Mandos" value={String(settlement.controllerCount)} testID="mandos-utilizados" />
      {settlement.penaltyCents > 0 ? (
        <Row
          label={`Exceso (${settlement.extraMinutes} min)`}
          value={formatMoney(settlement.penaltyCents)}
          testID="penalidad"
        />
      ) : null}
      <View className="mt-1 flex-row items-center justify-between rounded-xl bg-secondary p-4">
        <Text className="text-xl font-bold">Total</Text>
        <Text testID="total-cobro" className="text-4xl font-bold">
          {formatMoney(settlement.totalCents)}
        </Text>
      </View>
    </Card>
  );
}
