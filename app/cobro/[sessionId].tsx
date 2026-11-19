import { CheckCheck, Flag } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { PaymentForm } from '../../src/components/PaymentForm';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SettlementSummary } from '../../src/components/SettlementSummary';
import { StateView } from '../../src/components/StateView';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
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
// finalizarla; una vez finalizada queda "por cobrar" con el resumen fijo y el formulario de pago
// (HU-006).
export default function SettlementScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const bottomInset = useBottomInset();
  const now = useNow();
  const { data: session, isPending } = useSessionDetail(sessionId);
  const endSession = useEndSession();
  const registerPayment = useRegisterPayment();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

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

  async function finish() {
    setConfirming(false);
    setError(null);
    const result = await endSession.mutateAsync(sessionId);
    if (!result.ok) {
      setError(result.message);
    }
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
      <ScreenHeader
        title={session.consoleName}
        subtitle={active ? 'Resumen hasta ahora' : payable ? 'Por cobrar' : 'Sesión cobrada'}
        onBack={() => router.back()}
      />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        <SettlementSummary
          settlement={settlement}
          state={active ? 'en_juego' : payable ? 'por_cobrar' : 'disponible'}
        />
        {payable ? (
          <PaymentForm
            totalCents={session.totalCents}
            isPending={registerPayment.isPending}
            error={error}
            onSubmit={pay}
          />
        ) : error ? (
          <View
            accessibilityRole="alert"
            className="rounded-2xl border border-playing/40 bg-playing-soft p-4"
          >
            <Text className="font-bold text-playing-tone">{error}</Text>
          </View>
        ) : null}
        {!active && !payable ? (
          <View className="flex-row items-center gap-3 rounded-2xl border border-available/40 bg-available-soft p-4">
            <Icon as={CheckCheck} size={22} className="text-available-tone" />
            <Text className="flex-1 text-base font-semibold text-available-tone">
              Esta sesión ya está cobrada.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {active ? (
        <View
          className="border-t border-border bg-card px-4 pt-3"
          style={{ paddingBottom: bottomInset + 12 }}
        >
          <Button
            testID="finalizar-sesion"
            size="lg"
            disabled={endSession.isPending}
            onPress={() => setConfirming(true)}
            className="h-16 rounded-2xl"
          >
            <Icon as={Flag} size={20} className="text-primary-foreground" />
            <Text className="text-xl font-bold">Finalizar sesión</Text>
          </Button>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirming}
        icon={Flag}
        title="Finalizar sesión"
        message={`Se detiene el tiempo de ${session.consoleName} y queda por cobrar. No se puede deshacer.`}
        confirmLabel="Finalizar"
        onConfirm={finish}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
