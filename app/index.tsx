import { Link, Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { ConsoleCard } from '../src/components/ConsoleCard';
import { TypeFilter } from '../src/components/TypeFilter';
import { useActiveSessions } from '../src/hooks/useActiveSessions';
import { useConsoles } from '../src/hooks/useConsoles';
import type { ConsoleWithStock } from '../src/services/consoleService';
import { useWallFilterStore } from '../src/stores/wallFilterStore';

// Muro de consolas (HU-001, T07): una tarjeta por consola del inventario con su estado actual.
export default function ConsoleWallScreen() {
  const router = useRouter();
  const { data: consoles, isPending, error } = useConsoles();
  // Las sesiones activas se restauran desde SQLite al abrir la app (T10).
  const { data: sessions } = useActiveSessions();
  const sessionByConsole = new Map(sessions?.map((s) => [s.consoleId, s]));
  const consoleType = useWallFilterStore((s) => s.consoleType);
  const visible = consoles?.filter((c) => consoleType === null || c.consoleType === consoleType);

  function openSession(console: ConsoleWithStock) {
    router.push({ pathname: '/sesion/[consoleId]', params: { consoleId: console.id } });
  }

  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ title: 'Muro de consolas' }} />
      <View className="px-4 pb-2 pt-4">
        <TypeFilter />
      </View>
      {isPending ? (
        <ActivityIndicator size="large" className="mt-12" />
      ) : error ? (
        <Text className="m-4 text-lg text-playing">No se pudo leer el inventario.</Text>
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
                onPress={openSession}
              />
              {/* Con un número impar de consolas, la última no ocupa toda la fila. */}
              {visible && index === visible.length - 1 && visible.length % 2 === 1 ? (
                <View className="flex-1" />
              ) : null}
            </>
          )}
          ListEmptyComponent={
            <Text className="text-lg text-muted">No hay consolas de este tipo.</Text>
          }
          ListFooterComponent={
            __DEV__ ? (
              <View className="mt-6 gap-3">
                <Link href="/dev/persistencia" className="text-base text-primary underline">
                  Prueba de persistencia (solo desarrollo)
                </Link>
                <Link href="/dev/spike-cronometro" className="text-base text-primary underline">
                  Spike del cronómetro (solo desarrollo)
                </Link>
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}
