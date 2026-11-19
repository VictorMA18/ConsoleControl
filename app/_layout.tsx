import '../global.css';

import {
  MontserratAlternates_500Medium,
  MontserratAlternates_600SemiBold,
  MontserratAlternates_700Bold,
  MontserratAlternates_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat-alternates';
import { QueryClientProvider } from '@tanstack/react-query';
import { isRunningInExpoGo } from 'expo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { BrandSplash } from '../src/components/BrandSplash';
import { StateView } from '../src/components/StateView';
import { useDatabaseSetup } from '../src/db/migrate';
import { queryClient } from '../src/hooks/queryClient';
import { applySavedTheme } from '../src/stores/themeStore';
import { startSyncLoop } from '../src/sync/connectivity';
import { useThemeColors } from '../src/utils/theme';

// La pantalla de carga nativa (ícono de la app, app.json) se queda hasta que la base de datos y la
// fuente están listas, y se va con un fundido corto. Así no aparece un spinner intermedio.
// Expo Go muestra su propia pantalla de carga y no permite configurarla: el fundido solo se pide
// en el APK.
SplashScreen.preventAutoHideAsync().catch(() => {});
if (!isRunningInExpoGo()) {
  SplashScreen.setOptions({ fade: true, duration: 250 });
}
applySavedTheme();

export default function RootLayout() {
  const { ready, error } = useDatabaseSetup();
  const colors = useThemeColors();
  // Si la fuente no carga, la app sigue con la del sistema en lugar de quedarse en blanco.
  const [fontsLoaded, fontError] = useFonts({
    MontserratAlternates_500Medium,
    MontserratAlternates_600SemiBold,
    MontserratAlternates_700Bold,
    MontserratAlternates_800ExtraBold,
  });
  const fontsDone = fontsLoaded || Boolean(fontError);
  // Pantalla de marca encima de la app al abrirla; se va sola (BrandSplash).
  const [brandVisible, setBrandVisible] = useState(true);
  const hideBrand = useCallback(() => setBrandVisible(false), []);

  // Respaldo en la nube (HU-008): arranca cuando la base está lista y corre aparte de la interfaz.
  useEffect(() => (ready ? startSyncLoop() : undefined), [ready]);

  useEffect(() => {
    if ((ready && fontsDone) || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsDone, error]);

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

  if (!ready || !fontsDone) {
    // Detrás de la pantalla de carga nativa: mismo fondo para que el fundido no destelle.
    return <View className="flex-1 bg-background" />;
  }

  // Las pantallas leen SQLite solo después de aplicar migraciones y datos iniciales. Cada pantalla
  // dibuja su propia cabecera (ScreenHeader), así que la nativa se oculta. Abrir una pantalla la
  // desliza desde la derecha y volver atrás la devuelve hacia la derecha; el diálogo de sesión sube
  // desde abajo y al cerrarlo baja. Todo es la animación nativa del stack (ADR 0014).
  return (
    // KeyboardProvider permite que los formularios se desplacen hasta el campo enfocado
    // (FormScrollView). La app va de borde a borde, por eso las barras del sistema son translúcidas.
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="sesion/[consoleId]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen name="cobro/[sessionId]" />
          <Stack.Screen name="dev/persistencia" />
          <Stack.Screen name="dev/spike-cronometro" />
          <Stack.Screen name="salud/[consoleId]" />
        </Stack>
        {brandVisible ? <BrandSplash onDone={hideBrand} /> : null}
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
