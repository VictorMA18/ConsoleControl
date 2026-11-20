import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Vibration, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { AlertBanner } from '../../src/components/AlertBanner';
import { ConsoleCard } from '../../src/components/ConsoleCard';
import { ConsoleSearch } from '../../src/components/ConsoleSearch';
import { MaintenanceNotice } from '../../src/components/MaintenanceNotice';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StateView } from '../../src/components/StateView';
import { SyncIndicator } from '../../src/components/SyncIndicator';
import { TypeFilter } from '../../src/components/TypeFilter';
import { WallSummary } from '../../src/components/WallSummary';
import { useActiveSessions } from '../../src/hooks/useActiveSessions';
import { useConsoles } from '../../src/hooks/useConsoles';
import { useHourlyPrices } from '../../src/hooks/useHourlyPrices';
import { useMaintenanceStatus } from '../../src/hooks/useMaintenance';
import { useNow } from '../../src/hooks/useNow';
import { usePendingSessions } from '../../src/hooks/usePendingSessions';
import { useSessionAlerts } from '../../src/hooks/useSessionAlerts';
import type { ConsoleWithStock } from '../../src/services/consoleService';
import { getSessionAlertState, type SessionAlert } from '../../src/services/sessionAlerts';
import { matchesQuery, useWallFilterStore } from '../../src/stores/wallFilterStore';
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
  const { data: hourlyPrices } = useHourlyPrices();
  const maintenanceDue = useMaintenanceStatus().filter((m) => m.due).length;
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
  const query = useWallFilterStore((s) => s.query);
  const visible = consoles?.filter(
    (c) => (consoleType === null || c.consoleType === consoleType) && matchesQuery(c.name, query),
  );
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
      <ScreenHeader logo right={<SyncIndicator />} />
      {lastAlert ? <AlertBanner alert={lastAlert} onDismiss={() => setLastAlert(null)} /> : null}
      {maintenanceDue > 0 ? (
        <MaintenanceNotice count={maintenanceDue} onPress={() => router.push('/salud')} />
      ) : null}
      {isPending ? (
        <StateView kind="loading" message="Cargando consolas…" />
      ) : error ? (
        <StateView kind="error" message="No se pudo leer el inventario." />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="gap-4 pb-8 pt-4"
        >
          <View className="px-4">
            <WallSummary states={states} />
          </View>
          <View className="gap-3 px-4">
            <ConsoleSearch />
            <TypeFilter />
          </View>
          {visible && visible.length > 0 ? (
            // Una columna de tarjetas anchas, legibles a distancia (ADR 0014). Al filtrar, las que
            // quedan se reacomodan con una transición y las nuevas aparecen con un fundido corto.
            <View className="gap-3 px-4">
              {visible.map((item, index) => (
                <Animated.View
                  key={item.id}
                  // Entrada escalonada corta (40 ms por tarjeta, tope de 200 ms).
                  entering={FadeIn.duration(220).delay(Math.min(index, 5) * 40)}
                  layout={LinearTransition.duration(220)}
                >
                  <ConsoleCard
                    console={item}
                    session={sessionByConsole.get(item.id)}
                    hourCents={hourlyPrices?.[item.consoleType]}
                    onPress={openConsole}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <StateView
              kind="empty"
              message={
                query ? `No hay ninguna máquina «${query}».` : 'No hay consolas de este tipo.'
              }
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}
