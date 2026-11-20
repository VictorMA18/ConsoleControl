import { Gamepad2, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useSessionAlertState } from '../hooks/useSessionAlerts';
import { useSessionTimer } from '../hooks/useSessionTimer';
import type { ConsoleWithStock } from '../services/consoleService';
import type { ActiveSession } from '../services/sessionService';
import { CARD_STATE_STYLES, cardState, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';
import { formatDuration } from '../utils/formatDuration';
import { formatMoney } from '../utils/formatMoney';
import { SESSION_MODE_LABELS } from '../utils/sessionLabels';
import { StatusPill } from './StatusPill';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  console: ConsoleWithStock;
  session?: ActiveSession;
  onPress: (console: ConsoleWithStock) => void;
};

// Tarjeta de una consola del muro (T07): nombre, estado y mandos disponibles. Con una sesión
// activa muestra además su cronómetro y el avance del tiempo (T11). El estado se muestra con
// color, icono y texto.
export function ConsoleCard({ console, session, onPress }: Props) {
  if (session) {
    return <BusyConsoleCard console={console} session={session} onPress={onPress} />;
  }
  return (
    <CardShell console={console} state={cardState(console.status, null)} onPress={onPress}>
      <View className="flex-row items-center gap-2">
        <Icon as={Gamepad2} size={16} className="text-muted-foreground" />
        <Text
          accessibilityLabel={`${CONSOLE_TYPE_LABELS[console.consoleType]}, ${console.operationalControllers} mandos libres`}
          className="text-base text-muted-foreground"
        >
          {console.operationalControllers} mandos libres
        </Text>
      </View>
    </CardShell>
  );
}

// El cronómetro se recalcula cada segundo desde started_at (ADR 0003): solo para mostrar.
function BusyConsoleCard({ console, session, onPress }: Required<Props>) {
  const { elapsedMs, remainingMs } = useSessionTimer(session);
  const alertState = useSessionAlertState(session);
  const state = cardState(console.status, alertState);
  const payable = session.status === 'por_cobrar';
  const progress =
    session.durationMs && !payable
      ? Math.min(100, Math.round((elapsedMs / session.durationMs) * 100))
      : null;
  return (
    <CardShell console={console} state={state} onPress={onPress}>
      <Text
        testID={`cronometro-${console.id}`}
        accessibilityLabel={`Tiempo transcurrido ${formatDuration(elapsedMs)}`}
        className="text-4xl font-extrabold tracking-tight"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatDuration(elapsedMs)}
      </Text>
      {progress !== null ? (
        <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <View
            className={cn('h-1.5 rounded-full', CARD_STATE_STYLES[state].band)}
            style={{ width: `${progress}%` }}
          />
        </View>
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text
          className="text-sm font-medium text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {payable
            ? `Total ${formatMoney(session.totalCents)}`
            : remainingMs === null
              ? SESSION_MODE_LABELS[session.mode]
              : `Quedan ${formatDuration(remainingMs)}`}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Icon as={Users} size={14} className="text-muted-foreground" />
          <Text className="text-sm font-medium text-muted-foreground">
            {session.controllerCount} {session.controllerCount === 1 ? 'mando' : 'mandos'}
          </Text>
        </View>
      </View>
    </CardShell>
  );
}

type ShellProps = {
  console: ConsoleWithStock;
  state: CardState;
  onPress: (console: ConsoleWithStock) => void;
  children: React.ReactNode;
};

function CardShell({ console, state, onPress, children }: ShellProps) {
  const style = CARD_STATE_STYLES[state];
  const alerting = state === 'por_terminar' || state === 'tiempo_cumplido';
  return (
    <Pressable
      testID={`console-card-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${style.label}`}
      onPress={() => onPress(console)}
      className="w-full active:opacity-80"
    >
      <View
        className={cn(
          'overflow-hidden rounded-3xl border bg-card',
          alerting ? 'border-warning/60' : 'border-border',
          state === 'mantenimiento' && 'opacity-70',
        )}
      >
        <View className={cn('h-1.5', style.band)} />
        <View className="gap-3 p-4">
          <StatusPill testID={`estado-${console.id}`} state={state} />
          <Text className="text-2xl font-extrabold tracking-tight">{console.name}</Text>
          {children}
        </View>
      </View>
    </Pressable>
  );
}
