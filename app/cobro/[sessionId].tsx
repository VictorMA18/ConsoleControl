import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { PaymentForm } from '../../src/components/PaymentForm';
import { SettlementSummary } from '../../src/components/SettlementSummary';
import { StateView } from '../../src/components/StateView';
import { Button } from '../../src/components/ui/button';
import { Text } from '../../src/components/ui/text';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { useEndSession } from '../../src/hooks/useEndSession';
import { useNow } from '../../src/hooks/useNow';
import { useRegisterPayment } from '../../src/hooks/useRegisterPayment';
import { useSessionDetail } from '../../src/hooks/useSessionDetail';
import type { PaymentLineInput } from '../../src/schemas/payment';
import { calculateSettlement } from '../../src/services/settlement';

// Resumen de cobro de una consola ocupada (HU-005, CU-002). Mientras la sesión sigue activa muestra
// la liquidación al momento (se recalcula cada segundo, sin consultar la base) y permite
// finalizarla; una vez finalizada la deja "por cobrar" con el resumen fijo. El pago es HU-006.
export default function SettlementScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const bottomInset = useBottomInset();
  const now = useNow();
  const { data: session, isPending } = useSessionDetail(sessionId);
  const endSession = useEndSession();
  const registerPayment = useRegisterPayment();
  const [error, setError] = useState<string | null>(null);

  if (isPending) {
    return <StateView kind="loading" />;
  }
  if (!session) {
    return <StateView kind="error" message="La sesión no existe." />;
  }

  const active = session.status === 'activa';
  const payable = session.status === 'por_cobrar';
  // Una sesión finalizada se detiene en ended_at (ADR 0003); la activa llega hasta ahora.
  const settlement = calculateSettlement({
    consoleType: session.consoleType,
    controllerCount: session.controllerCount,
    durationMs: session.durationMs,
    startedAt: session.startedAt,
    endedAt: session.endedAt ?? now,
    rates: session.rateSnapshot,
  });

  function confirmEnd() {
    Alert.alert('Finalizar sesión', `¿Finalizar la sesión de ${session?.consoleName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          setError(null);
          const result = await endSession.mutateAsync(sessionId);
          if (!result.ok) {
            setError(result.message);
          }
        },
      },
    ]);
  }

  async function pay(payments: PaymentLineInput[]) {
    setError(null);
    const result = await registerPayment.mutateAsync({ sessionId, payments });
    if (result.ok) {
      router.back();
    } else {
      setError(result.message);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: `Cobro · ${session.consoleName}` }} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        <Text variant="large">
          {active ? 'Resumen hasta ahora' : payable ? 'Por cobrar' : 'Sesión cobrada'}
        </Text>
        <SettlementSummary settlement={settlement} />
        {payable ? (
          <PaymentForm
            totalCents={session.totalCents}
            isPending={registerPayment.isPending}
            error={error}
            onSubmit={pay}
          />
        ) : error ? (
          <View accessibilityRole="alert" className="rounded-xl bg-playing-soft p-4">
            <Text className="font-bold">{error}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View
        className="border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: Math.max(bottomInset, 12) }}
      >
        {active ? (
          <Button
            testID="finalizar-sesion"
            size="lg"
            disabled={endSession.isPending}
            onPress={confirmEnd}
            className="h-16 rounded-xl"
          >
            <Text className="text-xl font-bold">Finalizar sesión</Text>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.back()}
            className="h-16 rounded-xl border-2"
          >
            <Text className="text-xl font-bold">Volver al muro</Text>
          </Button>
        )}
      </View>
    </View>
  );
}
