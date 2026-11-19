import { useState } from 'react';
import { View } from 'react-native';

import { calculateChange, parseTendered } from '../services/change';
import { formatMoney } from '../utils/formatMoney';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Text } from './ui/text';

type Props = {
  // Parte del cobro que se paga en efectivo, en céntimos (en pago mixto, solo esa parte).
  cashCents: number;
};

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'] as const;

// Calculadora de vuelto (HU-010): teclado numérico, lo entregado por el cliente y el vuelto en
// números grandes y de alto contraste. Sin lógica de datos: solo muestra y calcula.
export function ChangeCalculator({ cashCents }: Props) {
  const [typed, setTyped] = useState('');
  const tenderedCents = parseTendered(typed);
  const { changeCents, missingCents } = calculateChange(cashCents, tenderedCents);
  const entered = typed !== '';

  function press(key: (typeof KEYS)[number]) {
    if (key === '⌫') {
      setTyped((text) => text.slice(0, -1));
    } else if (key === '.') {
      setTyped((text) => (text.includes('.') ? text : `${text || '0'}.`));
    } else {
      // Máximo dos decimales y un tope razonable para no desbordar la pantalla.
      setTyped((text) => (/\.\d\d$/.test(text) || text.length >= 7 ? text : text + key));
    }
  }

  return (
    <Card className="gap-4 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-muted-foreground">A cobrar en efectivo</Text>
        <Text className="text-xl font-bold">{formatMoney(cashCents)}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-muted-foreground">Entregó</Text>
        <Text testID="entregado" className="text-2xl font-bold">
          {formatMoney(tenderedCents)}
        </Text>
      </View>

      <View
        accessibilityLiveRegion="polite"
        className={`items-center rounded-xl p-4 ${missingCents > 0 && entered ? 'bg-playing-soft' : 'bg-secondary'}`}
      >
        {missingCents > 0 && entered ? (
          <>
            <Text className="text-lg font-bold">Falta</Text>
            <Text testID="faltante" className="text-5xl font-bold text-destructive">
              {formatMoney(missingCents)}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-lg font-bold">Vuelto</Text>
            <Text testID="vuelto" className="text-5xl font-bold">
              {formatMoney(changeCents)}
            </Text>
          </>
        )}
      </View>

      <View className="flex-row flex-wrap gap-2">
        {KEYS.map((key) => (
          <Button
            key={key}
            variant="outline"
            accessibilityLabel={key === '⌫' ? 'Borrar' : key}
            onPress={() => press(key)}
            className="h-14 basis-[31%] grow rounded-xl"
          >
            <Text className="text-2xl font-bold">{key}</Text>
          </Button>
        ))}
      </View>
      <Button variant="secondary" onPress={() => setTyped((cashCents / 100).toString())}>
        <Text className="text-base font-semibold">Pagó exacto</Text>
      </Button>
    </Card>
  );
}
