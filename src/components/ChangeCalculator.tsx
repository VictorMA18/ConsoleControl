import { useState } from 'react';
import { View } from 'react-native';

import { calculateChange, parseTendered } from '../services/change';
import { cn } from '../utils/cn';
import { formatMoney } from '../utils/formatMoney';
import { Input } from './ui/input';
import { Text } from './ui/text';

type Props = {
  // Parte del cobro que se paga en efectivo, en céntimos (en pago mixto, solo esa parte).
  cashCents: number;
};

// Vuelto (HU-010): un solo campo con lo que entregó el cliente y, debajo, el vuelto en números
// grandes. Se escribe con el teclado numérico del celular. Sin lógica de datos: solo calcula.
export function ChangeCalculator({ cashCents }: Props) {
  const [typed, setTyped] = useState('');
  const tenderedCents = parseTendered(typed);
  const { changeCents, missingCents } = calculateChange(cashCents, tenderedCents);
  const entered = typed.trim() !== '';
  const short = entered && missingCents > 0;

  return (
    <View className="gap-4 rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between">
        <Text accessibilityRole="header" className="text-base font-extrabold">
          Efectivo
        </Text>
        <Text
          className="text-base font-bold text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          A cobrar {formatMoney(cashCents)}
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-muted-foreground">Recibido</Text>
        <View className="flex-row items-center rounded-2xl border border-input bg-raised px-4">
          <Text className="text-2xl font-bold text-muted-foreground">S/</Text>
          <Input
            testID="entregado"
            accessibilityLabel="Monto recibido en efectivo"
            keyboardType="decimal-pad"
            value={typed}
            onChangeText={setTyped}
            placeholder={(cashCents / 100).toFixed(2)}
            maxLength={8}
            className="h-16 flex-1 border-0 bg-transparent px-3 text-3xl font-extrabold"
          />
        </View>
      </View>

      <View
        accessibilityLiveRegion="polite"
        className={cn(
          'flex-row items-center justify-between rounded-2xl px-4 py-3',
          short ? 'bg-playing-soft' : 'bg-available-soft',
        )}
      >
        <Text
          className={cn(
            'text-base font-extrabold',
            short ? 'text-playing-tone' : 'text-available-tone',
          )}
        >
          {short ? 'Falta' : 'Vuelto'}
        </Text>
        <Text
          testID={short ? 'faltante' : 'vuelto'}
          className={cn(
            'text-4xl font-extrabold tracking-tight',
            short ? 'text-playing-tone' : 'text-available-tone',
          )}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatMoney(short ? missingCents : changeCents)}
        </Text>
      </View>
    </View>
  );
}
