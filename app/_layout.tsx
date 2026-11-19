import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { StateView } from '../src/components/StateView';
import { useDatabaseSetup } from '../src/db/migrate';
import { queryClient } from '../src/hooks/queryClient';
import { COLORS } from '../src/utils/theme';

export default function RootLayout() {
  const { ready, error } = useDatabaseSetup();

  if (error) {
    return (
      <View className="flex-1 justify-center bg-background">
        <StateView
          kind="error"
          message={`No se pudo preparar la base de datos: ${error.message}`}
        />
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 justify-center bg-background">
        <StateView kind="loading" />
      </View>
    );
  }

  // Las pantallas leen SQLite solo después de aplicar migraciones y datos iniciales.
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.foreground,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="sesion/[consoleId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cobro/[sessionId]" options={{ title: 'Cobro' }} />
      </Stack>
    </QueryClientProvider>
  );
}
