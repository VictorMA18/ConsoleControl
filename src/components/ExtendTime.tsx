import { TimerReset } from 'lucide-react-native';
import { View } from 'react-native';

import { EXTENSION_MINUTES, planExtension, type ExtendableSession } from '../services/extension';
import { TOLERANCE_MINUTES } from '../services/tariff';
import { formatDuration } from '../utils/formatDuration';
import { formatMoney } from '../utils/formatMoney';
import { Section } from './Section';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  session: ExtendableSession;
  now: number;
  isPending: boolean;
  onExtend: (minutes: number) => void;
};

const LABELS: Record<(typeof EXTENSION_MINUTES)[number], string> = {
  30: '+30 min',
  60: '+1 h',
  120: '+2 h',
};

// "Añadir tiempo" (HU-009): 30 min, 1 h o 2 h, cada uno con el total estimado nuevo, calculado sin
// tocar la base. Sirve también en «Por terminar» y con el tiempo ya cumplido: sumar tiempo cubre el
// exceso. No aparece en tiempo libre.
export function ExtendTime({ session, now, isPending, onExtend }: Props) {
  if (session.mode === 'libre' || session.durationMs === null) {
    return null;
  }
  const endsAt = session.startedAt + session.durationMs;
  const overdue = now >= endsAt;
  const overdueMinutes = Math.floor((now - endsAt) / 60_000);
  return (
    <Section
      title="Añadir tiempo"
      trailing={
        overdue
          ? `Exceso ${formatDuration(now - endsAt)}`
          : `Quedan ${formatDuration(endsAt - now)}`
      }
    >
      <View className="flex-row gap-2">
        {EXTENSION_MINUTES.map((minutes) => {
          const plan = planExtension(session, minutes, now);
          return (
            <Button
              key={minutes}
              testID={`extender-${minutes}`}
              variant="outline"
              disabled={!plan.ok || isPending}
              onPress={() => onExtend(minutes)}
              accessibilityLabel={`Añadir ${LABELS[minutes]}${plan.ok ? `, total ${formatMoney(plan.totalCents)}` : ''}`}
              className="h-auto flex-1 flex-col gap-1 px-2 py-3"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon as={TimerReset} size={18} />
                <Text className="text-base font-extrabold">{LABELS[minutes]}</Text>
              </View>
              {plan.ok ? (
                // A todo el ancho y centrado: dentro de un contenedor centrado Android mide corto
                // el texto con esta fuente y corta el monto.
                <Text
                  numberOfLines={1}
                  className="w-full text-center text-xs font-semibold text-muted-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatMoney(plan.totalCents)}
                </Text>
              ) : null}
            </Button>
          );
        })}
      </View>
      <Text className="text-sm text-muted-foreground">
        {overdue
          ? overdueMinutes < TOLERANCE_MINUTES
            ? `Tolerancia de ${TOLERANCE_MINUTES} min: aún no se cobra exceso. Sumar tiempo lo evita.`
            : 'Pasó la tolerancia: se cobra el exceso. Sumar tiempo lo cubre.'
          : 'El cronómetro sigue corriendo; solo cambian el vencimiento y el monto estimado.'}
      </Text>
    </Section>
  );
}
