import {
  Banknote,
  CircleAlert,
  CircleCheck,
  History,
  Lock,
  NotebookPen,
  Smartphone,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { FormScrollView } from '../../src/components/FormScrollView';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
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
    box: 'bg-available-soft',
    tone: 'text-available-tone',
    icon: CircleCheck,
  },
  faltante: {
    box: 'bg-playing-soft',
    tone: 'text-playing-tone',
    icon: TriangleAlert,
  },
  sobrante: {
    box: 'bg-warning-soft',
    tone: 'text-warning-tone',
    icon: CircleAlert,
  },
} as const;

// Una fila por método de pago: ícono, nombre, monto y qué porcentaje del turno representa.
function MethodRow({
  icon,
  label,
  cents,
  totalCents,
  testID,
}: {
  icon: LucideIcon;
  label: string;
  cents: number;
  totalCents: number;
  testID: string;
}) {
  // Qué parte del total representa, en texto (sin barras: se veían recargadas).
  const share = totalCents > 0 ? Math.round((cents / totalCents) * 100) : 0;
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <Icon as={icon} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold">{label}</Text>
        <Text
          className="text-xs font-semibold text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {share} % del turno
        </Text>
      </View>
      <Text
        testID={testID}
        className={cn('text-lg font-extrabold', cents === 0 && 'text-muted-foreground')}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatMoney(cents)}
      </Text>
    </View>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })} · ${formatTime(timestamp)}`;
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
  const sessionCount = new Set(payments.map((payment) => payment.sessionId)).size;

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
      <ScreenHeader
        title="Caja"
        subtitle={
          overview?.shift
            ? `Turno abierto desde las ${formatTime(overview.shift.openedAt)}`
            : 'Sin turno abierto'
        }
      />
      <FormScrollView>
        {message ? (
          <View
            accessibilityLiveRegion="polite"
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Icon as={Lock} size={20} />
            <Text className="flex-1 text-base font-bold">{message}</Text>
          </View>
        ) : null}

        {/* Lo cobrado en el turno abierto, en grande, y su reparto por método. */}
        {hasShift && overview?.shift ? (
          <View className="gap-5 rounded-3xl border border-border bg-card p-5">
            <View className="gap-1">
              <Text className="text-sm font-bold text-muted-foreground">Total del turno</Text>
              <Text
                testID="total-turno"
                className="text-5xl font-extrabold tracking-tight"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatMoney(balance.totalCents)}
              </Text>
              <Text className="text-sm font-semibold text-muted-foreground">
                {sessionCount === 1 ? '1 sesión cobrada' : `${sessionCount} sesiones cobradas`}
              </Text>
            </View>
            <View className="h-px bg-border" />
            <MethodRow
              icon={Banknote}
              label="Efectivo"
              cents={balance.cashCents}
              totalCents={balance.totalCents}
              testID="total-efectivo"
            />
            <MethodRow
              icon={Smartphone}
              label="Yape y Plin"
              cents={balance.digitalCents}
              totalCents={balance.totalCents}
              testID="total-digital"
            />
            <MethodRow
              icon={NotebookPen}
              label="Fiado"
              cents={balance.creditCents}
              totalCents={balance.totalCents}
              testID="total-fiado"
            />
          </View>
        ) : (
          <View className="items-center gap-3 rounded-3xl border border-dashed border-border p-8">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <Icon as={Banknote} size={24} className="text-muted-foreground" />
            </View>
            <Text className="text-center text-lg font-extrabold">Sin turno abierto</Text>
            <Text className="text-center text-sm text-muted-foreground">
              El próximo cobro abre un turno nuevo.
            </Text>
          </View>
        )}

        {hasShift ? (
          <Section
            title="Arqueo de efectivo"
            trailing={`Esperado ${formatMoney(balance.cashCents)}`}
          >
            <Text className="text-sm text-muted-foreground">
              Cuenta el efectivo de la caja y escríbelo para compararlo con lo cobrado.
            </Text>
            <View className="flex-row items-center rounded-2xl border border-input bg-raised px-4">
              <Text className="text-2xl font-bold text-muted-foreground">S/</Text>
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
                maxLength={9}
                className="h-16 flex-1 border-0 bg-transparent px-3 text-3xl font-extrabold"
              />
            </View>
            {typed ? (
              <View
                accessibilityLiveRegion="polite"
                className={cn('flex-row items-center gap-3 rounded-2xl px-4 py-3', look.box)}
              >
                <Icon as={look.icon} size={26} className={look.tone} />
                <Text testID="balance" className={cn('flex-1 text-xl font-extrabold', look.tone)}>
                  {BALANCE_LABELS[balance.status]}
                </Text>
                <Text
                  testID="diferencia"
                  className={cn('text-xl font-extrabold', look.tone)}
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatSignedMoney(balance.differenceCents)}
                </Text>
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

        <Section
          title="Turnos cerrados"
          trailing={closedShifts?.length ? `${closedShifts.length}` : undefined}
        >
          {closedShifts && closedShifts.length > 0 ? (
            closedShifts.map((shift, index) => {
              const shiftLook = BALANCE_LOOK[shift.balance ?? 'conforme'];
              const total =
                (shift.cashCents ?? 0) + (shift.digitalCents ?? 0) + (shift.creditCents ?? 0);
              return (
                <View
                  key={shift.id}
                  className={cn('gap-1 pt-3', index > 0 && 'border-t border-border')}
                >
                  <View className="flex-row items-center gap-3">
                    <Icon as={History} size={18} className="text-muted-foreground" />
                    <Text className="flex-1 text-base font-bold">
                      {formatDateTime(shift.closedAt ?? shift.openedAt)}
                    </Text>
                    <Text
                      className="text-base font-extrabold"
                      style={{ fontVariant: ['tabular-nums'] }}
                    >
                      {formatMoney(total)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between pl-[30px]">
                    <Text className="text-sm text-muted-foreground">
                      Contado {formatMoney(shift.countedCashCents ?? 0)}
                    </Text>
                    <View
                      className={cn(
                        'flex-row items-center gap-1.5 rounded-full px-2.5 py-1',
                        shiftLook.box,
                      )}
                    >
                      <Icon as={shiftLook.icon} size={13} className={shiftLook.tone} />
                      <Text className={cn('text-xs font-bold', shiftLook.tone)}>
                        {shift.balance ? BALANCE_LABELS[shift.balance] : ''}{' '}
                        {formatSignedMoney(shift.differenceCents ?? 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text className="text-base text-muted-foreground">Aún no hay turnos cerrados.</Text>
          )}
        </Section>
      </FormScrollView>

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
