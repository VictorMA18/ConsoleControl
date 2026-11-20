import { Clock3, Coins, Gamepad2, Hourglass } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { useSessionAlertState } from '../hooks/useSessionAlerts';
import { useSessionTimer } from '../hooks/useSessionTimer';
import type { ConsoleWithStock } from '../services/consoleService';
import type { ActiveSession } from '../services/sessionService';
import { CARD_STATE_STYLES, cardState, type CardState } from '../utils/cardState';
import { cn } from '../utils/cn';
import { formatDuration } from '../utils/formatDuration';
import { formatMoney } from '../utils/formatMoney';
import { SESSION_MODE_LABELS } from '../utils/sessionLabels';
import { EASE_OUT_BEZIER } from '../utils/theme';
import { InfoRow } from './InfoRow';
import { PlatformBadge } from './PlatformBadge';
import { PressableScale } from './PressableScale';
import { STATE_ICONS } from './stateIcons';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  console: ConsoleWithStock;
  session?: ActiveSession;
  // Precio de una hora con un mando, para la tarjeta libre.
  hourCents?: number;
  onPress: (console: ConsoleWithStock) => void;
};

// Cuando cambia el estado, el color de la franja pasa al nuevo en 200 ms en lugar de saltar.
const BAND_TRANSITION = {
  transitionProperty: 'backgroundColor',
  transitionDuration: 200,
  transitionTimingFunction: cubicBezier(...EASE_OUT_BEZIER),
} as const;

// Parpadeo de "Por terminar" (HU-004, T16): solo la opacidad de la etiqueta, en el hilo de UI.
const BLINK = {
  animationName: { from: { opacity: 1 }, to: { opacity: 0.4 } },
  animationDuration: '700ms',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
  animationTimingFunction: 'ease-in-out',
} as const;

const IDLE_TIME = '00:00:00';

// Tarjeta de una consola del muro (T07, T11), con el diseño de VN (ADR 0014): franja con el
// estado, plataforma y nombre, cronómetro y, a la derecha, mandos, tiempo y dinero.
export function ConsoleCard({ console, session, hourCents, onPress }: Props) {
  if (session) {
    return <BusyConsoleCard console={console} session={session} onPress={onPress} />;
  }
  const state = cardState(console.status, null);
  return (
    <CardShell
      console={console}
      state={state}
      onPress={onPress}
      time={IDLE_TIME}
      idle
      rows={
        <>
          <InfoRow icon={Gamepad2}>
            {console.operationalControllers}{' '}
            {console.operationalControllers === 1 ? 'mando' : 'mandos'}
          </InfoRow>
          <InfoRow icon={Hourglass} muted>
            {state === 'mantenimiento'
              ? 'Sin uso'
              : state === 'averiado'
                ? 'Fuera de servicio'
                : 'Libre'}
          </InfoRow>
          <InfoRow icon={Coins} muted>
            {hourCents === undefined ? '—' : `${formatMoney(hourCents)}/h`}
          </InfoRow>
        </>
      }
    />
  );
}

// El cronómetro se recalcula cada segundo desde started_at (ADR 0003): solo para mostrar.
function BusyConsoleCard({
  console,
  session,
  onPress,
}: Required<Pick<Props, 'console' | 'session' | 'onPress'>>) {
  const { elapsedMs, remainingMs } = useSessionTimer(session);
  const alertState = useSessionAlertState(session);
  const state = cardState(console.status, alertState);
  const payable = session.status === 'por_cobrar';
  // Los mandos prestados pasan a 'en_uso': el total de la consola son los prestados más los libres.
  const total = session.controllerCount + console.operationalControllers;
  return (
    <CardShell
      console={console}
      state={state}
      onPress={onPress}
      time={formatDuration(elapsedMs)}
      rows={
        <>
          <InfoRow icon={Gamepad2}>
            {session.controllerCount}/{total} {total === 1 ? 'mando' : 'mandos'}
          </InfoRow>
          <InfoRow icon={Hourglass} testID={`restante-${console.id}`}>
            {payable
              ? 'Terminó'
              : remainingMs === null
                ? SESSION_MODE_LABELS[session.mode]
                : remainingMs > 0
                  ? formatDuration(remainingMs)
                  : 'Cumplido'}
          </InfoRow>
          <InfoRow icon={Coins}>
            {session.mode === 'libre' && !payable ? 'Al final' : formatMoney(session.totalCents)}
          </InfoRow>
        </>
      }
    />
  );
}

type ShellProps = {
  console: ConsoleWithStock;
  state: CardState;
  onPress: (console: ConsoleWithStock) => void;
  time: string;
  rows: React.ReactNode;
  idle?: boolean;
};

function CardShell({ console, state, onPress, time, rows, idle }: ShellProps) {
  const reducedMotion = useReducedMotion();
  const style = CARD_STATE_STYLES[state];
  const blinking = state === 'por_terminar' && !reducedMotion;
  return (
    <PressableScale
      testID={`console-card-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${style.label}`}
      onPress={() => onPress(console)}
      className="w-full"
    >
      <View
        className={cn(
          'overflow-hidden rounded-3xl border border-border bg-card',
          (state === 'mantenimiento' || state === 'averiado') && 'opacity-80',
        )}
      >
        <Animated.View
          testID={`estado-${console.id}`}
          className={cn('flex-row items-center px-5 py-2.5', style.band)}
          style={BAND_TRANSITION}
        >
          <Animated.View
            testID={blinking ? 'ambar-titilante' : undefined}
            className="flex-row items-center gap-2"
            style={blinking ? BLINK : undefined}
          >
            <Icon as={STATE_ICONS[state]} size={18} strokeWidth={2.5} className={style.onBand} />
            <Text className={cn('text-lg font-extrabold', style.onBand)}>{style.label}</Text>
          </Animated.View>
        </Animated.View>

        <View className="gap-3 px-5 pb-4 pt-3.5">
          {/* Fila 1, a todo el ancho: plataforma y nombre de la máquina. */}
          <View className="flex-row items-center gap-2.5">
            <PlatformBadge consoleType={console.consoleType} compact />
            <Text className="shrink text-2xl font-extrabold tracking-tight" numberOfLines={1}>
              {console.name}
            </Text>
          </View>
          {/* Fila 2: cronómetro a la izquierda; mandos, tiempo y dinero a la derecha. */}
          <View className="flex-row items-center gap-4">
            <View className="flex-1 flex-row items-center gap-2">
              <Icon
                as={Clock3}
                size={24}
                strokeWidth={2.25}
                className={idle ? 'text-muted-foreground' : 'text-foreground'}
              />
              <Text
                testID={`cronometro-${console.id}`}
                numberOfLines={1}
                adjustsFontSizeToFit
                className={cn('shrink text-[28px] font-extrabold', idle && 'text-muted-foreground')}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {time}
              </Text>
            </View>
            <View className="w-px self-stretch bg-border" />
            <View className="justify-center gap-2.5">{rows}</View>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
