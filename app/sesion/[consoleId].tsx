import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// Diálogo de sesión: se construye en T08.
export default function SessionDialogScreen() {
  const { consoleId } = useLocalSearchParams<{ consoleId: string }>();
  return (
    <View className="flex-1 bg-surface p-4">
      <Stack.Screen options={{ title: 'Nueva sesión' }} />
      <Text className="text-base text-muted">{consoleId}</Text>
    </View>
  );
}
