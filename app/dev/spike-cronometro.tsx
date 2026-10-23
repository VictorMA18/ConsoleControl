import { Redirect, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createTestSession,
  finishActiveSessions,
  getPersistenceSnapshot,
} from '../../src/services/persistenceCheck';

// Spike de TW-82 (solo desarrollo). Compara dos formas de medir el tiempo de una sesión:
// A) un contador en memoria que suma 1 cada segundo, y
// B) la hora de inicio guardada en SQLite restada de la hora actual (ADR 0003).
// Se usa en el celular para ver qué pasa al minimizar, cerrar y reiniciar.

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString();
}

export default function TimerSpikeScreen() {
  const [memoryCounter, setMemoryCounter] = useState(0);
  const [startedAt, setStartedAt] = useState<number>();
  const [now, setNow] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const lastTick = useRef(0);

  const log = useCallback((text: string) => {
    setEvents((prev) => [`${clock(Date.now())} · ${text}`, ...prev].slice(0, 30));
  }, []);

  const loadSession = useCallback(() => {
    getPersistenceSnapshot()
      .then((snapshot) => {
        const latest = snapshot.activeSessions.at(-1);
        setStartedAt(latest?.startedAt);
        log(latest ? `Sesión leída de SQLite (inicio ${clock(latest.startedAt)})` : 'Sin sesión');
      })
      .catch((e: unknown) => log(`Error al leer: ${String(e)}`));
  }, [log]);

  useEffect(() => {
    loadSession();
    const interval = setInterval(() => {
      const current = Date.now();
      // Si entre dos ticks pasó mucho más de 1 s, el sistema pausó el intervalo.
      if (lastTick.current && current - lastTick.current > 2000) {
        log(`Intervalo pausado ${Math.round((current - lastTick.current) / 1000)} s`);
      }
      lastTick.current = current;
      setMemoryCounter((n) => n + 1);
      setNow(current);
    }, 1000);
    const subscription = AppState.addEventListener('change', (state) => log(`AppState: ${state}`));
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [loadSession, log]);

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const onStart = () => {
    finishActiveSessions()
      .then(() => createTestSession())
      .then((session) => {
        setStartedAt(session.startedAt);
        setMemoryCounter(0);
        log(`Prueba iniciada (inicio ${clock(session.startedAt)})`);
      })
      .catch((e: unknown) => log(`Error al iniciar: ${String(e)}`));
  };

  const onStop = () => {
    finishActiveSessions()
      .then(() => {
        setStartedAt(undefined);
        log('Prueba terminada');
      })
      .catch((e: unknown) => log(`Error al terminar: ${String(e)}`));
  };

  const persisted = startedAt && now ? (now - startedAt) / 1000 : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Spike del cronómetro' }} />

      <View style={styles.card}>
        <Text style={styles.label}>A) Contador en memoria</Text>
        <Text style={styles.time}>{formatSeconds(memoryCounter)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>B) Ahora − hora de inicio en SQLite</Text>
        <Text style={styles.time}>
          {persisted === undefined ? '--:--:--' : formatSeconds(persisted)}
        </Text>
        {startedAt ? <Text>Inicio guardado: {clock(startedAt)}</Text> : null}
      </View>

      <View style={styles.buttons}>
        <Button title="Iniciar prueba" onPress={onStart} />
        <Button title="Terminar prueba" onPress={onStop} />
      </View>

      <Text style={styles.label}>Eventos</Text>
      {events.map((event, i) => (
        <Text key={`${i}-${event}`} style={styles.event}>
          {event}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 40,
    fontVariant: ['tabular-nums'],
  },
  buttons: {
    gap: 12,
  },
  event: {
    fontSize: 12,
  },
});
