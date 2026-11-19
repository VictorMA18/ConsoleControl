import { CircleAlert, Delete, HandCoins } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { calculateChange, parseTendered } from '../services/change';
import { cn } from '../utils/cn';
import { formatMoney } from '../utils/formatMoney';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
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
  const short = missingCents > 0 && entered;

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
    <View className="gap-4 rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-base text-muted-foreground">A cobrar en efectivo</Text>
        <Text className="text-xl font-bold" style={{ fontVariant: ['tabular-nums'] }}>
          {formatMoney(cashCents)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-base text-muted-foreground">Entregó</Text>
        <Text
          testID="entregado"
          className="text-3xl font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatMoney(tenderedCents)}
        </Text>
      </View>

      {/* Mismo lenguaje que la tarjeta de consola: franja con la etiqueta y el monto grande. */}
      <View
        accessibilityLiveRegion="polite"
        className="overflow-hidden rounded-3xl border border-border bg-card"
      >
        <View
          className={cn(
            'flex-row items-center gap-2 px-5 py-2.5',
            short ? 'bg-playing' : 'bg-available',
          )}
        >
          <Icon
            as={short ? CircleAlert : HandCoins}
            size={18}
            strokeWidth={2.5}
            className={short ? 'text-playing-foreground' : 'text-available-foreground'}
          />
          <Text
            className={cn(
              'text-lg font-extrabold',
              short ? 'text-playing-foreground' : 'text-available-foreground',
            )}
          >
            {short ? 'Falta' : 'Vuelto'}
          </Text>
        </View>
        <Text
          testID={short ? 'faltante' : 'vuelto'}
          className={cn(
            'px-5 py-4 text-center text-6xl font-extrabold tracking-tight',
            short ? 'text-playing-tone' : 'text-foreground',
          )}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatMoney(short ? missingCents : changeCents)}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {KEYS.map((key) => (
          <View key={key} className="basis-[31%] grow">
            <Button
              variant="secondary"
              accessibilityLabel={key === '⌫' ? 'Borrar' : key}
              onPress={() => press(key)}
              className="h-14 w-full rounded-2xl"
            >
              {key === '⌫' ? (
                <Icon as={Delete} size={24} />
              ) : (
                <Text className="text-2xl font-bold">{key}</Text>
              )}
            </Button>
          </View>
        ))}
      </View>
      <Button
        variant="outline"
        onPress={() => setTyped((cashCents / 100).toString())}
        className="h-12"
      >
        <Text className="text-base font-semibold">Pagó exacto</Text>
      </Button>
    </View>
  );
}
