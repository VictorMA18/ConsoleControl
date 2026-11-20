import { TimerOff, TimerReset } from 'lucide-react-native';
import { View } from 'react-native';

import { EXTENSION_MINUTES, planExtension, type ExtendableSession } from '../services/extension';
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

// "Añadir tiempo" (HU-009): un botón por bloque con el nuevo total, calculado sin tocar la base.
// No aparece en tiempo libre. Con el tiempo cumplido explica que hay que finalizar.
export function ExtendTime({ session, now, isPending, onExtend }: Props) {
  if (session.mode === 'libre' || session.durationMs === null) {
    return null;
  }
  const endsAt = session.startedAt + session.durationMs;
  if (now >= endsAt) {
    return (
      <Section title="Añadir tiempo">
        <View className="flex-row items-center gap-3">
          <Icon as={TimerOff} size={20} className="text-warning-tone" />
          <Text className="flex-1 text-sm text-muted-foreground">
            El tiempo ya se cumplió: finaliza la sesión para cobrar el exceso.
          </Text>
        </View>
      </Section>
    );
  }
  return (
    <Section title="Añadir tiempo" trailing={`Quedan ${formatDuration(endsAt - now)}`}>
      <View className="flex-row gap-3">
        {EXTENSION_MINUTES.map((minutes) => {
          const plan = planExtension(session, minutes, now);
          return (
            <Button
              key={minutes}
              testID={`extender-${minutes}`}
              variant="outline"
              disabled={!plan.ok || isPending}
              onPress={() => onExtend(minutes)}
              accessibilityLabel={`Añadir ${minutes} minutos${plan.ok ? `, total ${formatMoney(plan.totalCents)}` : ''}`}
              className="h-auto flex-1 flex-col gap-1 py-3"
            >
              <View className="flex-row items-center gap-2">
                <Icon as={TimerReset} size={20} />
                <Text className="text-lg font-extrabold">+{minutes} min</Text>
              </View>
              {plan.ok ? (
                <Text
                  className="text-sm font-semibold text-muted-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  Total {formatMoney(plan.totalCents)}
                </Text>
              ) : null}
            </Button>
          );
        })}
      </View>
      <Text className="text-sm text-muted-foreground">
        El cronómetro sigue corriendo; solo cambian el vencimiento y el monto.
      </Text>
    </Section>
  );
}
