import { ChevronRight, Terminal } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Vibration, View } from 'react-native';

import { AlertBanner } from '../../src/components/AlertBanner';
import { ConsoleCard } from '../../src/components/ConsoleCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StateView } from '../../src/components/StateView';
import { TypeFilter } from '../../src/components/TypeFilter';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { WallSummary } from '../../src/components/WallSummary';
import { useActiveSessions } from '../../src/hooks/useActiveSessions';
import { useConsoles } from '../../src/hooks/useConsoles';
import { useNow } from '../../src/hooks/useNow';
import { usePendingSessions } from '../../src/hooks/usePendingSessions';
import { useSessionAlerts } from '../../src/hooks/useSessionAlerts';
import type { ConsoleWithStock } from '../../src/services/consoleService';
import { getSessionAlertState, type SessionAlert } from '../../src/services/sessionAlerts';
import { useWallFilterStore } from '../../src/stores/wallFilterStore';
import { cardState } from '../../src/utils/cardState';

// Dos vibraciones de medio segundo: se distinguen de una notificación cualquiera.
const ALERT_VIBRATION = [0, 500, 250, 500];

// Muro de consolas (HU-001, T07): una tarjeta por consola del inventario con su estado actual.
export default function ConsoleWallScreen() {
  const router = useRouter();
  const now = useNow();
  const { data: consoles, isPending, error } = useConsoles();
  // Las sesiones activas se restauran desde SQLite al abrir la app (T10).
  const { data: sessions } = useActiveSessions();
  // Las finalizadas esperan su pago y siguen ocupando la consola (HU-005).
  const { data: pending } = usePendingSessions();
  const sessionByConsole = new Map(
    [...(sessions ?? []), ...(pending ?? [])].map((s) => [s.consoleId, s]),
  );
  const [lastAlert, setLastAlert] = useState<SessionAlert | null>(null);

  // HU-004 (T16): cada alerta llega una sola vez por sesión; el celular vibra y queda el aviso.
  useSessionAlerts((alert) => {
    Vibration.vibrate(ALERT_VIBRATION);
    setLastAlert(alert);
  });
  const consoleType = useWallFilterStore((s) => s.consoleType);
  const visible = consoles?.filter((c) => consoleType === null || c.consoleType === consoleType);
  const states = (consoles ?? []).map((c) => {
    const session = sessionByConsole.get(c.id);
    return cardState(c.status, session ? getSessionAlertState(session, now) : null);
  });

  // Una consola con sesión abre su resumen de cobro (HU-005); una libre, el diálogo de inicio.
  function openConsole(console: ConsoleWithStock) {
    const session = sessionByConsole.get(console.id);
    if (session) {
      router.push({ pathname: '/cobro/[sessionId]', params: { sessionId: session.id } });
    } else {
      router.push({ pathname: '/sesion/[consoleId]', params: { consoleId: console.id } });
    }
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        logo
        right={
          <Text className="text-lg font-bold" style={{ fontVariant: ['tabular-nums'] }}>
            {new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        }
      />
      {lastAlert ? <AlertBanner alert={lastAlert} onDismiss={() => setLastAlert(null)} /> : null}
      {isPending ? (
        <StateView kind="loading" message="Cargando consolas…" />
      ) : error ? (
        <StateView kind="error" message="No se pudo leer el inventario." />
      ) : (
        <ScrollView contentContainerClassName="gap-4 pb-8 pt-4">
          <View className="px-4">
            <WallSummary states={states} />
          </View>
          <View className="px-4">
            <TypeFilter />
          </View>
          {visible && visible.length > 0 ? (
            <View className="flex-row flex-wrap px-2.5">
              {visible.map((item) => (
                <View key={item.id} className="w-1/2 p-1.5">
                  <ConsoleCard
                    console={item}
                    session={sessionByConsole.get(item.id)}
                    onPress={openConsole}
                  />
                </View>
              ))}
            </View>
          ) : (
            <StateView kind="empty" message="No hay consolas de este tipo." />
          )}
          {__DEV__ ? (
            <View className="mx-4 mt-2 gap-1 rounded-3xl border border-dashed border-border p-4">
              <View className="flex-row items-center gap-2 pb-1">
                <Icon as={Terminal} size={16} className="text-muted-foreground" />
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Herramientas de desarrollo
                </Text>
              </View>
              <DevLink href="/dev/persistencia" label="Prueba de persistencia" />
              <DevLink href="/dev/spike-cronometro" label="Spike del cronómetro" />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function DevLink({
  href,
  label,
}: {
  href: '/dev/persistencia' | '/dev/spike-cronometro';
  label: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Link href={href} className="font-sans text-base font-semibold text-foreground">
        {label}
      </Link>
      <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
    </View>
  );
}
