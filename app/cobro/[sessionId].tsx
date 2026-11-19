import { CheckCheck, Flag } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { ExtendTime } from '../../src/components/ExtendTime';
import { FormScrollView } from '../../src/components/FormScrollView';
import { PaymentForm } from '../../src/components/PaymentForm';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SettlementSummary } from '../../src/components/SettlementSummary';
import { StateView } from '../../src/components/StateView';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { useEndSession } from '../../src/hooks/useEndSession';
import { useExtendSession } from '../../src/hooks/useExtendSession';
import { useNow } from '../../src/hooks/useNow';
import { useRegisterPayment } from '../../src/hooks/useRegisterPayment';
import { useSessionDetail } from '../../src/hooks/useSessionDetail';
import type { PaymentLineInput } from '../../src/schemas/payment';
import { getSessionAlertState } from '../../src/services/sessionAlerts';
import { calculateSettlement } from '../../src/services/settlement';
import { CARD_STATE_STYLES, cardState, type CardState } from '../../src/utils/cardState';

// Resumen de cobro de una consola ocupada (HU-005, CU-002). Mientras la sesión sigue activa muestra
// la liquidación al momento (se recalcula cada segundo, sin consultar la base) y permite
// finalizarla; una vez finalizada queda "por cobrar" con el resumen fijo y el formulario de pago
// (HU-006). Mientras está activa y es de tiempo fijo se le puede añadir tiempo (HU-009).
export default function SettlementScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const bottomInset = useBottomInset();
  const now = useNow();
  const { data: session, isPending } = useSessionDetail(sessionId);
  const endSession = useEndSession();
  const extendSession = useExtendSession();
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
  // Mismo estado que la tarjeta del muro: en juego, por terminar, tiempo cumplido o por cobrar.
  const state: CardState = active
    ? cardState('en_juego', getSessionAlertState(session, now))
    : payable
      ? 'por_cobrar'
      : 'disponible';
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

  async function extend(minutes: number) {
    setError(null);
    const result = await extendSession.mutateAsync({ id: sessionId, minutes });
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
        subtitle={
          active
            ? `${CARD_STATE_STYLES[state].label} · resumen hasta ahora`
            : payable
              ? 'Por cobrar'
              : 'Sesión cobrada'
        }
        onBack={() => router.back()}
      />
      <FormScrollView insetBottom={!active}>
        <SettlementSummary settlement={settlement} state={state} />
        {active ? (
          <ExtendTime
            session={session}
            now={now}
            isPending={extendSession.isPending}
            onExtend={extend}
          />
        ) : null}
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
      </FormScrollView>

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
