import {
  Banknote,
  Check,
  NotebookPen,
  QrCode,
  Smartphone,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { PAYMENT_METHODS, type PaymentMethod } from '../db/schema/enums';
import { type PaymentLineInput, paymentLinesSchemaFor } from '../schemas/payment';
import { parseTendered } from '../services/change';
import { PAYMENT_METHOD_LABELS } from '../utils/paymentLabels';
import { ChangeCalculator } from './ChangeCalculator';
import { ChoiceButton } from './ChoiceButton';
import { Section } from './Section';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Text } from './ui/text';

type Props = {
  totalCents: number;
  isPending: boolean;
  error: string | null;
  onSubmit: (lines: PaymentLineInput[]) => void;
};

const METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  efectivo: Banknote,
  yape: Smartphone,
  plin: QrCode,
  fiado: NotebookPen,
};

// Formulario de cobro (HU-006): uno o varios métodos con su monto. "Cobrar y Liberar" solo se
// habilita cuando el pago está clasificado y suma exactamente el total (RN-04). Con un solo método
// el monto es el total; con dos, al escribir uno el otro se completa con el resto.
export function PaymentForm({ totalCents, isPending, error, onSubmit }: Props) {
  const [selected, setSelected] = useState<PaymentMethod[]>([]);
  const [amounts, setAmounts] = useState<Partial<Record<PaymentMethod, string>>>({});
  const [customerName, setCustomerName] = useState('');

  const lines: PaymentLineInput[] = selected.map((method) => ({
    method,
    amountCents: selected.length === 1 ? totalCents : parseTendered(amounts[method] ?? ''),
    ...(method === 'fiado' && customerName.trim() ? { customerName: customerName.trim() } : {}),
  }));
  const check = paymentLinesSchemaFor(totalCents).safeParse(lines);
  const problem =
    selected.length > 1 && !check.success ? (check.error.issues[0]?.message ?? null) : null;
  const cashCents = lines.find((line) => line.method === 'efectivo')?.amountCents ?? 0;

  function toggle(method: PaymentMethod) {
    if (selected.includes(method)) {
      setSelected(selected.filter((m) => m !== method));
      return;
    }
    // Al pasar de uno a dos métodos, el primero conserva el total para que se pueda dividir.
    if (selected.length === 1) {
      setAmounts({ [selected[0] as PaymentMethod]: (totalCents / 100).toString() });
    }
    setSelected([...selected, method]);
  }

  function setAmount(method: PaymentMethod, text: string) {
    const next = { ...amounts, [method]: text };
    if (selected.length === 2) {
      const other = selected.find((m) => m !== method) as PaymentMethod;
      const rest = totalCents - parseTendered(text);
      next[other] = rest > 0 ? (rest / 100).toString() : '';
    }
    setAmounts(next);
  }

  return (
    <View className="gap-4">
      <Section title="Método de pago">
        <View className="flex-row flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <View key={method} className="basis-[48%] grow">
              <ChoiceButton
                testID={`metodo-${method}`}
                role="checkbox"
                icon={METHOD_ICONS[method]}
                label={PAYMENT_METHOD_LABELS[method]}
                selected={selected.includes(method)}
                onPress={() => toggle(method)}
              />
            </View>
          ))}
        </View>
        <Text className="text-sm text-muted-foreground">
          Elige uno para cobrar todo con ese método, o varios para dividir el pago.
        </Text>
      </Section>

      {selected.length > 1 ? (
        <Section title="Monto por método">
          {selected.map((method) => (
            <View key={method} className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2.5">
                <Icon as={METHOD_ICONS[method]} size={20} className="text-muted-foreground" />
                <Text className="text-lg font-semibold">{PAYMENT_METHOD_LABELS[method]}</Text>
              </View>
              <Input
                testID={`monto-${method}`}
                accessibilityLabel={`Monto en ${PAYMENT_METHOD_LABELS[method]}`}
                keyboardType="decimal-pad"
                value={amounts[method] ?? ''}
                onChangeText={(text) => setAmount(method, text)}
                placeholder="0.00"
                className="w-40 text-right"
              />
            </View>
          ))}
          {problem ? (
            <Text accessibilityLiveRegion="polite" className="text-base font-bold text-playing">
              {problem}
            </Text>
          ) : null}
        </Section>
      ) : null}

      {selected.includes('fiado') ? (
        <Section title="Cliente (opcional)">
          <Input
            testID="nombre-fiado"
            accessibilityLabel="Nombre o apodo del cliente"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Nombre o apodo"
            maxLength={60}
          />
        </Section>
      ) : null}

      {cashCents > 0 ? <ChangeCalculator cashCents={cashCents} /> : null}

      {error ? (
        <View
          accessibilityRole="alert"
          className="rounded-2xl border border-playing/40 bg-playing-soft p-4"
        >
          <Text className="font-bold text-playing">{error}</Text>
        </View>
      ) : null}

      <Button
        testID="cobrar-y-liberar"
        size="lg"
        disabled={!check.success || isPending}
        onPress={() => onSubmit(lines)}
        className="h-16 rounded-2xl"
      >
        <Icon as={Check} size={22} className="text-primary-foreground" />
        <Text className="text-xl font-bold">Cobrar y Liberar</Text>
      </Button>
    </View>
  );
}
