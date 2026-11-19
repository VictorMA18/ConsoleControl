import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { PAYMENT_METHODS, type PaymentMethod } from '../db/schema/enums';
import { type PaymentLineInput, paymentLinesSchemaFor } from '../schemas/payment';
import { parseTendered } from '../services/change';
import { PAYMENT_METHOD_LABELS } from '../utils/paymentLabels';
import { ChangeCalculator } from './ChangeCalculator';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Text } from './ui/text';

type Props = {
  totalCents: number;
  isPending: boolean;
  error: string | null;
  onSubmit: (lines: PaymentLineInput[]) => void;
};

const INPUT_CLASS = 'h-12 rounded-xl border border-input bg-card px-3 text-xl text-foreground';

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
      <Card className="gap-3 px-4 py-4">
        <Text variant="large">Método de pago</Text>
        <View className="flex-row flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <Button
              key={method}
              testID={`metodo-${method}`}
              role="checkbox"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected.includes(method) }}
              variant={selected.includes(method) ? 'default' : 'outline'}
              onPress={() => toggle(method)}
              className="h-14 basis-[48%] grow rounded-xl"
            >
              <Text className="text-lg font-bold">{PAYMENT_METHOD_LABELS[method]}</Text>
            </Button>
          ))}
        </View>
        <Text className="text-base text-muted-foreground">
          Elige uno para cobrar todo con ese método, o varios para dividir el pago.
        </Text>
      </Card>

      {selected.length > 1 ? (
        <Card className="gap-3 px-4 py-4">
          <Text variant="large">Monto por método</Text>
          {selected.map((method) => (
            <View key={method} className="flex-row items-center justify-between gap-3">
              <Text className="text-lg font-semibold">{PAYMENT_METHOD_LABELS[method]}</Text>
              <TextInput
                testID={`monto-${method}`}
                accessibilityLabel={`Monto en ${PAYMENT_METHOD_LABELS[method]}`}
                keyboardType="decimal-pad"
                value={amounts[method] ?? ''}
                onChangeText={(text) => setAmount(method, text)}
                placeholder="0.00"
                className={`${INPUT_CLASS} w-40 text-right`}
              />
            </View>
          ))}
          {problem ? (
            <Text accessibilityLiveRegion="polite" className="text-lg font-bold text-destructive">
              {problem}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {selected.includes('fiado') ? (
        <Card className="gap-2 px-4 py-4">
          <Text variant="large">Cliente (opcional)</Text>
          <TextInput
            testID="nombre-fiado"
            accessibilityLabel="Nombre o apodo del cliente"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Nombre o apodo"
            maxLength={60}
            className={INPUT_CLASS}
          />
        </Card>
      ) : null}

      {cashCents > 0 ? <ChangeCalculator cashCents={cashCents} /> : null}

      {error ? (
        <View accessibilityRole="alert" className="rounded-xl bg-playing-soft p-4">
          <Text className="font-bold">{error}</Text>
        </View>
      ) : null}

      <Button
        testID="cobrar-y-liberar"
        size="lg"
        disabled={!check.success || isPending}
        onPress={() => onSubmit(lines)}
        className="h-16 rounded-xl"
      >
        <Text className="text-xl font-bold">Cobrar y Liberar</Text>
      </Button>
    </View>
  );
}
