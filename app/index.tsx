import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Pantalla inicial provisional. El muro de consolas se construye en T07.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Muro de consolas' }} />
      <Text style={styles.title}>ConsoleControl Mobile</Text>
      {__DEV__ ? (
        <>
          <Link href="/dev/persistencia" style={styles.devLink}>
            Prueba de persistencia (solo desarrollo)
          </Link>
          <Link href="/dev/spike-cronometro" style={styles.devLink}>
            Spike del cronómetro (solo desarrollo)
          </Link>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  devLink: {
    marginTop: 24,
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});
