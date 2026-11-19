import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';

import { StateView } from '../../src/components/StateView';
import { Button } from '../../src/components/ui/button';
import { Card } from '../../src/components/ui/card';
import { Text } from '../../src/components/ui/text';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { useClosedShifts, useCloseShift, useShiftOverview } from '../../src/hooks/useShift';
import { auditEntries, calculateBalance } from '../../src/services/balance';
import { parseTendered } from '../../src/services/change';
import { formatMoney, formatSignedMoney } from '../../src/utils/formatMoney';
import { PAYMENT_METHOD_LABELS } from '../../src/utils/paymentLabels';

const BALANCE_LABELS = {
  conforme: 'Conforme',
  faltante: 'Faltante',
  sobrante: 'Sobrante',
} as const;
const BALANCE_BOX = {
  conforme: 'bg-available-soft',
  faltante: 'bg-playing-soft',
  sobrante: 'bg-warning-soft',
} as const;

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

// Caja y finanzas (HU-007, CU-003): lo cobrado en el turno separado por método, el efectivo
// contado y el balance. "Cerrar Turno y Conciliar Caja" deja los registros del turno en solo
// lectura (RN-05).
export default function CashScreen() {
  const bottomInset = useBottomInset();
  const { data: overview, isPending } = useShiftOverview();
  const { data: closedShifts } = useClosedShifts();
  const closeShift = useCloseShift();
  const [counted, setCounted] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (isPending) {
    return <StateView kind="loading" />;
  }

  const payments = overview?.payments ?? [];
  const hasShift = overview?.shift != null;
  const typed = counted.trim() !== '';
  const balance = calculateBalance(payments, parseTendered(counted));
  const audit = typed && balance.needsAudit ? auditEntries(payments) : [];

  function confirmClose() {
    Alert.alert(
      'Cerrar turno',
      'Los cobros del turno quedarán en solo lectura. ¿Cerrar y conciliar la caja?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar turno',
          onPress: async () => {
            const result = await closeShift.mutateAsync(parseTendered(counted));
            if (result.ok) {
              setCounted('');
              setMessage(
                `Turno cerrado: ${BALANCE_LABELS[result.balance.status]} (${formatSignedMoney(result.balance.differenceCents)})`,
              );
            } else {
              setMessage(result.message);
            }
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Caja y finanzas' }} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        {message ? (
          <View accessibilityLiveRegion="polite" className="rounded-xl bg-secondary p-4">
            <Text className="text-lg font-bold">{message}</Text>
          </View>
        ) : null}

        <Card className="gap-3 px-4 py-4">
          <Text variant="large">Turno actual</Text>
          {hasShift ? (
            <>
              <Row
                label="Efectivo"
                value={formatMoney(balance.cashCents)}
                testID="total-efectivo"
              />
              <Row
                label="Yape y Plin"
                value={formatMoney(balance.digitalCents)}
                testID="total-digital"
              />
              <Row label="Fiado" value={formatMoney(balance.creditCents)} testID="total-fiado" />
              <Row label="Total cobrado" value={formatMoney(balance.totalCents)} />
            </>
          ) : (
            <Text className="text-base text-muted-foreground">
              No hay cobros abiertos. El próximo cobro abre un turno nuevo.
            </Text>
          )}
        </Card>

        {hasShift ? (
          <Card className="gap-3 px-4 py-4">
            <Text variant="large">Efectivo contado en caja</Text>
            <TextInput
              testID="efectivo-contado"
              accessibilityLabel="Efectivo contado en caja"
              keyboardType="decimal-pad"
              value={counted}
              onChangeText={(text) => {
                setCounted(text);
                setMessage(null);
              }}
              placeholder="0.00"
              className="h-14 rounded-xl border border-input bg-card px-3 text-2xl text-foreground"
            />
            {typed ? (
              <View
                accessibilityLiveRegion="polite"
                className={`items-center rounded-xl p-4 ${BALANCE_BOX[balance.status]}`}
              >
                <Text testID="balance" className="text-3xl font-bold">
                  {BALANCE_LABELS[balance.status]}
                </Text>
                <Text testID="diferencia" className="text-xl font-bold">
                  {formatSignedMoney(balance.differenceCents)}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {audit.length > 0 ? (
          <Card className="gap-2 px-4 py-4">
            <Text variant="large">Cobros a revisar</Text>
            <Text className="text-base text-muted-foreground">
              La diferencia supera S/ 2.00: estos cobros están modificados o tienen saldo pendiente.
            </Text>
            {audit.map((payment) => (
              <Text key={payment.id} className="text-base">
                {PAYMENT_METHOD_LABELS[payment.method]} · {formatMoney(payment.amountCents)}
                {payment.customerName ? ` · ${payment.customerName}` : ''}
                {payment.modifiedAt !== null ? ' · modificado' : ''}
              </Text>
            ))}
          </Card>
        ) : null}

        <Text variant="large">Turnos cerrados</Text>
        {closedShifts && closedShifts.length > 0 ? (
          closedShifts.map((shift) => (
            <Card key={shift.id} className="gap-1 px-4 py-4">
              <Text className="font-bold">
                {new Date(shift.closedAt ?? shift.openedAt).toLocaleString()} ·{' '}
                {shift.balance ? BALANCE_LABELS[shift.balance] : ''}
              </Text>
              <Text className="text-base text-muted-foreground">
                Efectivo {formatMoney(shift.cashCents ?? 0)} · Yape y Plin{' '}
                {formatMoney(shift.digitalCents ?? 0)} · Fiado {formatMoney(shift.creditCents ?? 0)}
              </Text>
              <Text className="text-base text-muted-foreground">
                Contado {formatMoney(shift.countedCashCents ?? 0)} · Diferencia{' '}
                {formatSignedMoney(shift.differenceCents ?? 0)}
              </Text>
            </Card>
          ))
        ) : (
          <StateView kind="empty" message="Aún no hay turnos cerrados." />
        )}
      </ScrollView>

      {hasShift ? (
        <View
          className="border-t border-border bg-card px-4 pt-3"
          style={{ paddingBottom: Math.max(bottomInset, 12) }}
        >
          <Button
            testID="cerrar-turno"
            size="lg"
            disabled={!typed || closeShift.isPending}
            onPress={confirmClose}
            className="h-16 rounded-xl"
          >
            <Text className="text-xl font-bold">Cerrar Turno y Conciliar Caja</Text>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
