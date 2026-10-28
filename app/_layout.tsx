import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseSetup } from '../src/db/migrate';
import { queryClient } from '../src/hooks/queryClient';

export default function RootLayout() {
  const { ready, error } = useDatabaseSetup();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>No se pudo preparar la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Las pantallas leen SQLite solo después de aplicar migraciones y datos iniciales.
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
