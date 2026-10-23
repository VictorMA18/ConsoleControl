import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseSetup } from '../src/db/migrate';

export const unstable_settings = {
  initialRouteName: 'index',
};

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

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Muro de consolas' }} />
    </Stack>
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
