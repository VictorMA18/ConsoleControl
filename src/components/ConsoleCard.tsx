import { Pressable, Text, View } from 'react-native';

import { useSessionAlertState } from '../hooks/useSessionAlerts';
import { useSessionTimer } from '../hooks/useSessionTimer';
import type { ConsoleWithStock } from '../services/consoleService';
import type { ActiveSession } from '../services/sessionService';
import { CARD_STATE_STYLES, cardState, type CardState } from '../utils/cardState';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';
import { formatDuration } from '../utils/formatDuration';
import { SESSION_MODE_LABELS } from '../utils/sessionLabels';

type Props = {
  console: ConsoleWithStock;
  session?: ActiveSession;
  onPress: (console: ConsoleWithStock) => void;
};

// Tarjeta de una consola del muro (T07): nombre, tipo, estado y mandos disponibles. Con una sesión
// activa muestra además su cronómetro (T11). El estado se muestra con color y con texto.
export function ConsoleCard({ console, session, onPress }: Props) {
  if (session) {
    return <BusyConsoleCard console={console} session={session} onPress={onPress} />;
  }
  return (
    <CardShell console={console} state={cardState(console.status, null)} onPress={onPress}>
      <Text className="text-base text-muted">
        {CONSOLE_TYPE_LABELS[console.consoleType]} · {console.operationalControllers} mandos libres
      </Text>
    </CardShell>
  );
}

// El cronómetro se recalcula cada segundo desde started_at (ADR 0003): solo para mostrar.
function BusyConsoleCard({ console, session, onPress }: Required<Props>) {
  const { elapsedMs, remainingMs } = useSessionTimer(session);
  const alertState = useSessionAlertState(session);
  const state = cardState(console.status, alertState);
  return (
    <CardShell console={console} state={state} onPress={onPress}>
      <Text
        testID={`cronometro-${console.id}`}
        accessibilityLabel={`Tiempo transcurrido ${formatDuration(elapsedMs)}`}
        className="text-3xl font-bold text-ink"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatDuration(elapsedMs)}
      </Text>
      <Text className="text-base text-muted" style={{ fontVariant: ['tabular-nums'] }}>
        {remainingMs === null
          ? SESSION_MODE_LABELS[session.mode]
          : `Quedan ${formatDuration(remainingMs)}`}{' '}
        · {session.controllerCount} {session.controllerCount === 1 ? 'mando' : 'mandos'}
      </Text>
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
  return (
    <Pressable
      testID={`console-card-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${style.label}`}
      onPress={() => onPress(console)}
      className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80"
    >
      <View testID={`estado-${console.id}`} className={`px-4 py-2 ${style.band}`}>
        <Text className={`text-base font-bold ${style.text}`}>{style.label}</Text>
      </View>
      <View className="gap-1 px-4 py-4">
        <Text className="text-2xl font-bold text-ink">{console.name}</Text>
        {children}
      </View>
    </Pressable>
  );
}
