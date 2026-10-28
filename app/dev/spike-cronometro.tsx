import { useQueryClient } from '@tanstack/react-query';
import { Redirect, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { activeSessionsQueryKey, useActiveSessions } from '../../src/hooks/useActiveSessions';
import { useNow } from '../../src/hooks/useNow';
import { useSessionTimer } from '../../src/hooks/useSessionTimer';
import {
  createTestSession,
  finishActiveSessions,
  getPersistenceSnapshot,
} from '../../src/services/persistenceCheck';
import type { ActiveSession } from '../../src/services/sessionService';
import { elapsedMs } from '../../src/services/sessionTimer';
import { formatDuration } from '../../src/utils/formatDuration';

// Spike de TW-82 (solo desarrollo). Compara dos formas de medir el tiempo de una sesión:
// A) un contador en memoria que suma 1 cada segundo, y
// B) la hora de inicio guardada en SQLite restada de la hora actual (ADR 0003).
// Se usa en el celular para ver qué pasa al minimizar, cerrar y reiniciar.

function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString();
}

// Una fila por sesión restaurada desde SQLite con el hook real del muro (TW-86).
function RestoredSessionRow({ session }: { session: ActiveSession }) {
  const timer = useSessionTimer(session);
  return (
    <Text>
      {session.consoleName} · {formatDuration(timer.elapsedMs)}
      {timer.remainingMs === null
        ? ' · tiempo libre'
        : ` · faltan ${formatDuration(timer.remainingMs)}`}
    </Text>
  );
}

export default function TimerSpikeScreen() {
  const queryClient = useQueryClient();
  const restored = useActiveSessions();
  const [memoryCounter, setMemoryCounter] = useState(0);
  const [startedAt, setStartedAt] = useState<number>();
  // B usa el mismo reloj compartido que usará el muro de consolas (TW-84).
  const now = useNow();
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
        void queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
        log(`Prueba iniciada (inicio ${clock(session.startedAt)})`);
      })
      .catch((e: unknown) => log(`Error al iniciar: ${String(e)}`));
  };

  const onStop = () => {
    finishActiveSessions()
      .then(() => {
        setStartedAt(undefined);
        void queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
        log('Prueba terminada');
      })
      .catch((e: unknown) => log(`Error al terminar: ${String(e)}`));
  };

  const persisted = startedAt
    ? elapsedMs({ startedAt, endedAt: null, durationMs: null }, now)
    : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Spike del cronómetro' }} />

      <View style={styles.card}>
        <Text style={styles.label}>A) Contador en memoria</Text>
        <Text style={styles.time}>{formatDuration(memoryCounter * 1000)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>B) Ahora − hora de inicio en SQLite</Text>
        <Text style={styles.time}>
          {persisted === undefined ? '--:--:--' : formatDuration(persisted)}
        </Text>
        {startedAt ? <Text>Inicio guardado: {clock(startedAt)}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sesiones restauradas al abrir la app (TW-86)</Text>
        {restored.isPending ? <Text>Cargando…</Text> : null}
        {restored.error ? <Text>Error: {restored.error.message}</Text> : null}
        {restored.data?.length === 0 ? <Text>Ninguna sesión activa</Text> : null}
        {restored.data?.map((session) => (
          <RestoredSessionRow key={session.id} session={session} />
        ))}
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
