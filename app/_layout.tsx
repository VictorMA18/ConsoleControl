import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseMigrations } from '../src/db/migrate';

export default function RootLayout() {
  const { success, error } = useDatabaseMigrations();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>No se pudo preparar la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
