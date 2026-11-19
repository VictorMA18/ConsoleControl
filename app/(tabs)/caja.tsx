import {
  Banknote,
  CircleAlert,
  CircleCheck,
  Lock,
  NotebookPen,
  Smartphone,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { StateView } from '../../src/components/StateView';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
import { Input } from '../../src/components/ui/input';
import { Text } from '../../src/components/ui/text';
import { useClosedShifts, useCloseShift, useShiftOverview } from '../../src/hooks/useShift';
import { auditEntries, calculateBalance } from '../../src/services/balance';
import { parseTendered } from '../../src/services/change';
import { cn } from '../../src/utils/cn';
import { formatMoney, formatSignedMoney } from '../../src/utils/formatMoney';
import { PAYMENT_METHOD_LABELS } from '../../src/utils/paymentLabels';

const BALANCE_LABELS = {
  conforme: 'Conforme',
  faltante: 'Faltante',
  sobrante: 'Sobrante',
} as const;
const BALANCE_LOOK = {
  conforme: {
    box: 'border-available/40 bg-available-soft',
    tone: 'text-available-tone',
    icon: CircleCheck,
  },
  faltante: {
    box: 'border-playing/40 bg-playing-soft',
    tone: 'text-playing-tone',
    icon: TriangleAlert,
  },
  sobrante: {
    box: 'border-warning/40 bg-warning-soft',
    tone: 'text-warning-tone',
    icon: CircleAlert,
  },
} as const;

function Stat({
  icon,
  label,
  value,
  testID,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  testID: string;
}) {
  return (
    <View className="min-w-[30%] grow gap-2 rounded-2xl border border-border bg-raised p-3">
      <Icon as={icon} size={18} className="text-muted-foreground" />
      <Text
        testID={testID}
        className="text-xl font-extrabold"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

// Caja y finanzas (HU-007, CU-003): lo cobrado en el turno separado por método, el efectivo
// contado y el balance. "Cerrar Turno y Conciliar Caja" deja los registros del turno en solo
// lectura (RN-05).
export default function CashScreen() {
  const { data: overview, isPending } = useShiftOverview();
  const { data: closedShifts } = useClosedShifts();
  const closeShift = useCloseShift();
  const [counted, setCounted] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (isPending) {
    return <StateView kind="loading" />;
  }

  const payments = overview?.payments ?? [];
  const hasShift = overview?.shift != null;
  const typed = counted.trim() !== '';
  const balance = calculateBalance(payments, parseTendered(counted));
  const audit = typed && balance.needsAudit ? auditEntries(payments) : [];
  const look = BALANCE_LOOK[balance.status];

  async function close() {
    setConfirming(false);
    const result = await closeShift.mutateAsync(parseTendered(counted));
    if (result.ok) {
      setCounted('');
      setMessage(
        `Turno cerrado: ${BALANCE_LABELS[result.balance.status]} (${formatSignedMoney(result.balance.differenceCents)})`,
      );
    } else {
      setMessage(result.message);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Caja" subtitle="Cobros y cierre de turno" />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        {message ? (
          <View
            accessibilityLiveRegion="polite"
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Icon as={Lock} size={20} />
            <Text className="flex-1 text-base font-bold">{message}</Text>
          </View>
        ) : null}

        <Section
          title="Turno actual"
          trailing={hasShift ? formatMoney(balance.totalCents) : undefined}
        >
          {hasShift ? (
            <View className="flex-row flex-wrap gap-2">
              <Stat
                icon={Banknote}
                label="Efectivo"
                value={formatMoney(balance.cashCents)}
                testID="total-efectivo"
              />
              <Stat
                icon={Smartphone}
                label="Yape y Plin"
                value={formatMoney(balance.digitalCents)}
                testID="total-digital"
              />
              <Stat
                icon={NotebookPen}
                label="Fiado"
                value={formatMoney(balance.creditCents)}
                testID="total-fiado"
              />
            </View>
          ) : (
            <Text className="text-base text-muted-foreground">
              No hay cobros abiertos. El próximo cobro abre un turno nuevo.
            </Text>
          )}
        </Section>

        {hasShift ? (
          <Section title="Efectivo contado en caja">
            <Input
              testID="efectivo-contado"
              accessibilityLabel="Efectivo contado en caja"
              keyboardType="decimal-pad"
              value={counted}
              onChangeText={(text) => {
                setCounted(text);
                setMessage(null);
              }}
              placeholder="0.00"
              className="h-16 text-3xl font-bold"
            />
            {typed ? (
              <View
                accessibilityLiveRegion="polite"
                className={cn('flex-row items-center gap-4 rounded-2xl border p-4', look.box)}
              >
                <Icon as={look.icon} size={32} className={look.tone} />
                <View>
                  <Text testID="balance" className={cn('text-2xl font-extrabold', look.tone)}>
                    {BALANCE_LABELS[balance.status]}
                  </Text>
                  <Text testID="diferencia" className={cn('text-lg font-bold', look.tone)}>
                    {formatSignedMoney(balance.differenceCents)}
                  </Text>
                </View>
              </View>
            ) : null}
          </Section>
        ) : null}

        {audit.length > 0 ? (
          <Section title="Cobros a revisar">
            <Text className="text-sm text-muted-foreground">
              La diferencia supera S/ 2.00: estos cobros están modificados o tienen saldo pendiente.
            </Text>
            {audit.map((payment) => (
              <View
                key={payment.id}
                className="flex-row items-center justify-between border-t border-border pt-3"
              >
                <Text className="text-base font-semibold">
                  {PAYMENT_METHOD_LABELS[payment.method]}
                  {payment.customerName ? ` · ${payment.customerName}` : ''}
                  {payment.modifiedAt !== null ? ' · modificado' : ''}
                </Text>
                <Text className="text-base font-bold">{formatMoney(payment.amountCents)}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        <Section title="Turnos cerrados">
          {closedShifts && closedShifts.length > 0 ? (
            closedShifts.map((shift) => {
              const shiftLook = BALANCE_LOOK[shift.balance ?? 'conforme'];
              return (
                <View
                  key={shift.id}
                  className="gap-2 rounded-2xl border border-border bg-raised p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold">
                      {new Date(shift.closedAt ?? shift.openedAt).toLocaleString()}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Icon as={shiftLook.icon} size={14} className={shiftLook.tone} />
                      <Text
                        className={cn('text-xs font-bold uppercase tracking-wider', shiftLook.tone)}
                      >
                        {shift.balance ? BALANCE_LABELS[shift.balance] : ''}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-muted-foreground">
                    Efectivo {formatMoney(shift.cashCents ?? 0)} · Yape y Plin{' '}
                    {formatMoney(shift.digitalCents ?? 0)} · Fiado{' '}
                    {formatMoney(shift.creditCents ?? 0)}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Contado {formatMoney(shift.countedCashCents ?? 0)} · Diferencia{' '}
                    {formatSignedMoney(shift.differenceCents ?? 0)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text className="text-base text-muted-foreground">Aún no hay turnos cerrados.</Text>
          )}
        </Section>

        <Section title="Apariencia">
          <ThemeToggle />
        </Section>
      </ScrollView>

      {hasShift ? (
        <View className="border-t border-border bg-card px-4 py-3">
          <Button
            testID="cerrar-turno"
            size="lg"
            disabled={!typed || closeShift.isPending}
            onPress={() => setConfirming(true)}
            className="h-16 rounded-2xl"
          >
            <Icon as={Lock} size={20} className="text-primary-foreground" />
            <Text className="text-lg font-bold">Cerrar Turno y Conciliar Caja</Text>
          </Button>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirming}
        icon={Lock}
        title="Cerrar turno"
        message="Los cobros del turno quedarán en solo lectura. ¿Cerrar y conciliar la caja?"
        confirmLabel="Cerrar turno"
        onConfirm={close}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
