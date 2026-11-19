import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Vibration, View } from 'react-native';

import { AlertBanner } from '../src/components/AlertBanner';
import { ConsoleCard } from '../src/components/ConsoleCard';
import { StateView } from '../src/components/StateView';
import { TypeFilter } from '../src/components/TypeFilter';
import { Card } from '../src/components/ui/card';
import { Text } from '../src/components/ui/text';
import { WallSummary } from '../src/components/WallSummary';
import { useActiveSessions } from '../src/hooks/useActiveSessions';
import { useConsoles } from '../src/hooks/useConsoles';
import { usePendingSessions } from '../src/hooks/usePendingSessions';
import { useSessionAlerts } from '../src/hooks/useSessionAlerts';
import type { ConsoleWithStock } from '../src/services/consoleService';
import type { SessionAlert } from '../src/services/sessionAlerts';
import { useWallFilterStore } from '../src/stores/wallFilterStore';

// Dos vibraciones de medio segundo: se distinguen de una notificación cualquiera.
const ALERT_VIBRATION = [0, 500, 250, 500];

// Muro de consolas (HU-001, T07): una tarjeta por consola del inventario con su estado actual.
export default function ConsoleWallScreen() {
  const router = useRouter();
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
      <Stack.Screen
        options={{
          title: 'Muro de consolas',
          headerRight: () => (
            <Link
              href="/caja"
              accessibilityLabel="Abrir caja"
              className="text-lg font-bold text-primary"
            >
              Caja
            </Link>
          ),
        }}
      />
      {lastAlert ? <AlertBanner alert={lastAlert} onDismiss={() => setLastAlert(null)} /> : null}
      <View className="gap-3 px-4 pb-2 pt-4">
        {consoles ? <WallSummary consoles={consoles} /> : null}
        <TypeFilter />
      </View>
      {isPending ? (
        <StateView kind="loading" message="Cargando consolas…" />
      ) : error ? (
        <StateView kind="error" message="No se pudo leer el inventario." />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperClassName="gap-3"
          contentContainerClassName="gap-3 p-4"
          renderItem={({ item, index }) => (
            <>
              <ConsoleCard
                console={item}
                session={sessionByConsole.get(item.id)}
                onPress={openConsole}
              />
              {/* Con un número impar de consolas, la última no ocupa toda la fila. */}
              {visible && index === visible.length - 1 && visible.length % 2 === 1 ? (
                <View className="flex-1" />
              ) : null}
            </>
          )}
          ListEmptyComponent={<StateView kind="empty" message="No hay consolas de este tipo." />}
          ListFooterComponent={
            __DEV__ ? (
              <Card className="mt-6 gap-2 px-4 py-4">
                <Text variant="small" className="text-muted-foreground">
                  Herramientas de desarrollo
                </Text>
                <Link href="/dev/persistencia" className="text-base text-primary underline">
                  Prueba de persistencia
                </Link>
                <Link href="/dev/spike-cronometro" className="text-base text-primary underline">
                  Spike del cronómetro
                </Link>
              </Card>
            ) : undefined
          }
        />
      )}
    </View>
  );
}
