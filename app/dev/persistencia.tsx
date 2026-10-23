import { Redirect, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createTestSession,
  finishActiveSessions,
  getPersistenceSnapshot,
  type PersistenceSnapshot,
} from '../../src/services/persistenceCheck';

// Pantalla de diagnóstico para la prueba de persistencia de TW-28. Solo existe en desarrollo.
// Usa estado local en lugar de TanStack Query porque no forma parte del producto.
export default function PersistenceScreen() {
  const [snapshot, setSnapshot] = useState<PersistenceSnapshot>();
  const [loadedAt, setLoadedAt] = useState(0);
  const [message, setMessage] = useState('');

  const reload = useCallback(() => {
    getPersistenceSnapshot()
      .then((result) => {
        setSnapshot(result);
        setLoadedAt(Date.now());
      })
      .catch((e: unknown) => setMessage(`Error al leer: ${String(e)}`));
  }, []);

  useEffect(reload, [reload]);

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const onCreate = () => {
    createTestSession()
      .then((session) => setMessage(`Sesión creada: ${session.id.slice(0, 8)}`))
      .catch((e: unknown) => setMessage(`Error al crear: ${String(e)}`))
      .finally(reload);
  };

  const onFinish = () => {
    finishActiveSessions()
      .then((total) => setMessage(`Sesiones finalizadas: ${total}`))
      .catch((e: unknown) => setMessage(`Error al finalizar: ${String(e)}`))
      .finally(reload);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Prueba de persistencia' }} />

      <Text style={styles.heading}>Datos guardados</Text>
      <Text>Consolas: {snapshot?.consoles ?? '…'}</Text>
      <Text>Mandos operativos: {snapshot?.operationalControllers ?? '…'}</Text>
      <Text>Tarifas: {snapshot?.rates ?? '…'}</Text>

      <Text style={styles.heading}>Sesiones activas: {snapshot?.activeSessions.length ?? '…'}</Text>
      {snapshot?.activeSessions.map((session) => (
        <Text key={session.id}>
          {session.id.slice(0, 8)} · inicio {new Date(session.startedAt).toLocaleTimeString()} ·
          hace {Math.floor((loadedAt - session.startedAt) / 60000)} min
        </Text>
      ))}

      <View style={styles.buttons}>
        <Button title="Crear sesión de prueba" onPress={onCreate} />
        <Button title="Finalizar sesiones activas" onPress={onFinish} />
        <Button title="Recargar" onPress={reload} />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 6,
  },
  heading: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    marginTop: 16,
    gap: 12,
  },
  message: {
    marginTop: 12,
  },
});
