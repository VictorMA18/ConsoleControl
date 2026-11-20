import { useQueryClient } from '@tanstack/react-query';
import { Play, Square, Timer } from 'lucide-react-native';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';

import { activeSessionsQueryKey, useActiveSessions } from '../../src/hooks/useActiveSessions';
import { useNow } from '../../src/hooks/useNow';
import { useSessionAlerts, useSessionAlertState } from '../../src/hooks/useSessionAlerts';
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
  // Estado de alerta de T15, con el que RF pintará la tarjeta en T16.
  const alertState = useSessionAlertState(session);
  return (
    <Text className="border-t border-border pt-3 text-base">
      {session.consoleName} · {formatDuration(timer.elapsedMs)}
      {timer.remainingMs === null
        ? ' · tiempo libre'
        : ` · faltan ${formatDuration(timer.remainingMs)}`}{' '}
      · {alertState}
    </Text>
  );
}

export default function TimerSpikeScreen() {
  const router = useRouter();
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

  // Avisos de T15 (TW-110). En T16, RF los usa para el ámbar titilante y la vibración.
  useSessionAlerts((alert) => {
    log(`🔔 ${alert.type}: ${alert.consoleName} (faltan ${formatDuration(alert.remainingMs)})`);
  });

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  // Sesión de 6 minutos: el aviso de 5 minutos llega al minuto 1 y el tiempo cumplido al 6.
  const onStart = (durationMs?: number) => {
    finishActiveSessions()
      .then(() => createTestSession(Date.now(), durationMs))
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
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Spike del cronómetro"
        subtitle="Solo desarrollo"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <Section title="A) Contador en memoria">
          <Text className="text-5xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
            {formatDuration(memoryCounter * 1000)}
          </Text>
        </Section>

        <Section title="B) Ahora − hora de inicio en SQLite">
          <Text className="text-5xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
            {persisted === undefined ? '--:--:--' : formatDuration(persisted)}
          </Text>
          {startedAt ? (
            <Text className="text-sm text-muted-foreground">
              Inicio guardado: {clock(startedAt)}
            </Text>
          ) : null}
        </Section>

        <Section title="Sesiones restauradas al abrir la app (TW-86)">
          {restored.isPending ? <Text className="text-muted-foreground">Cargando…</Text> : null}
          {restored.error ? (
            <Text className="text-playing">Error: {restored.error.message}</Text>
          ) : null}
          {restored.data?.length === 0 ? (
            <Text className="text-base text-muted-foreground">Ninguna sesión activa</Text>
          ) : null}
          {restored.data?.map((session) => (
            <RestoredSessionRow key={session.id} session={session} />
          ))}
        </Section>

        <View className="gap-2">
          <Button
            variant="secondary"
            onPress={() => onStart()}
            className="h-12 justify-start gap-3 px-4"
          >
            <Icon as={Play} size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold">Iniciar prueba</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={() => onStart(6 * 60 * 1000)}
            className="h-12 justify-start gap-3 px-4"
          >
            <Icon as={Timer} size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold">Iniciar prueba de 6 min (alertas T15)</Text>
          </Button>
          <Button variant="secondary" onPress={onStop} className="h-12 justify-start gap-3 px-4">
            <Icon as={Square} size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold">Terminar prueba</Text>
          </Button>
        </View>

        <Section title="Eventos">
          {events.length === 0 ? (
            <Text className="text-sm text-muted-foreground">Sin eventos todavía</Text>
          ) : null}
          {events.map((event, i) => (
            <Text key={`${i}-${event}`} className="text-xs text-muted-foreground">
              {event}
            </Text>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}
