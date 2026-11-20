import '../global.css';

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
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
  // Si la fuente no carga, la app sigue con la del sistema en lugar de quedarse en blanco.
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  });

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

  if (!ready || (!fontsLoaded && !fontError)) {
    return (
      <View className="flex-1 justify-center bg-background">
        <StateView kind="loading" />
      </View>
    );
  }

  // Las pantallas leen SQLite solo después de aplicar migraciones y datos iniciales. Cada pantalla
  // dibuja su propia cabecera (ScreenHeader), así que la nativa se oculta.
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="sesion/[consoleId]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="cobro/[sessionId]" />
        <Stack.Screen name="dev/persistencia" />
        <Stack.Screen name="dev/spike-cronometro" />
      </Stack>
    </QueryClientProvider>
  );
}
