import { Database, Play, RefreshCw, Square, TriangleAlert, Users, Zap } from 'lucide-react-native';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { Section } from '../../src/components/Section';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';

import { queryClient } from '../../src/hooks/queryClient';
import {
  createTestSession,
  finishActiveSessions,
  getPersistenceSnapshot,
  type PersistenceSnapshot,
  type SessionScenario,
  startNearlyDueSession,
  trySessionScenario,
} from '../../src/services/persistenceCheck';

// Pantalla de diagnóstico para la prueba de persistencia de TW-28 y los escenarios de inicio de
// sesión de T09. Solo existe en desarrollo.
// Usa estado local en lugar de TanStack Query porque no forma parte del producto.
export default function PersistenceScreen() {
  const router = useRouter();
  const bottomInset = useBottomInset();
  const [snapshot, setSnapshot] = useState<PersistenceSnapshot>();
  const [loadedAt, setLoadedAt] = useState(0);
  const [message, setMessage] = useState('');

  const reload = useCallback(() => {
    // El muro vuelve a leer consolas y sesiones al regresar a él.
    void queryClient.invalidateQueries();
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

  const onScenario = (scenario: SessionScenario) => {
    trySessionScenario(scenario)
      .then((result) => {
        if (result.ok) {
          setMessage(`Sesión iniciada: ${result.session.id.slice(0, 8)}`);
        } else if (result.reason === 'mandos_insuficientes') {
          const names = result.alternatives.map((c) => c.name).join(', ') || 'ninguna';
          setMessage(`${result.message}. Alternativas: ${names}`);
        } else {
          setMessage(result.message);
        }
      })
      .catch((e: unknown) => setMessage(`Error: ${String(e)}`))
      .finally(reload);
  };

  const onNearlyDue = () => {
    startNearlyDueSession()
      .then((result) =>
        setMessage(
          result.ok ? 'Sesión iniciada: quedan 6 min, la alerta salta en 1 min' : result.message,
        ),
      )
      .catch((e: unknown) => setMessage(`Error: ${String(e)}`))
      .finally(reload);
  };

  const onFinish = () => {
    finishActiveSessions()
      .then((total) => setMessage(`Sesiones finalizadas: ${total}`))
      .catch((e: unknown) => setMessage(`Error al finalizar: ${String(e)}`))
      .finally(reload);
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Prueba de persistencia"
        subtitle="Solo desarrollo"
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerClassName="gap-4 p-4"
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      >
        <Section
          title="Datos guardados"
          trailing={loadedAt ? new Date(loadedAt).toLocaleTimeString() : undefined}
        >
          <View className="flex-row flex-wrap gap-2">
            <Stat label="Consolas" value={snapshot?.consoles} />
            <Stat label="En juego" value={snapshot?.consolesInPlay} />
            <Stat label="Mandos operativos" value={snapshot?.operationalControllers} />
            <Stat label="Tarifas" value={snapshot?.rates} />
          </View>
        </Section>

        <Section title="Sesiones activas" trailing={String(snapshot?.activeSessions.length ?? '…')}>
          {snapshot?.activeSessions.length === 0 ? (
            <Text className="text-base text-muted-foreground">Ninguna sesión activa</Text>
          ) : null}
          {snapshot?.activeSessions.map((session) => (
            <View
              key={session.id}
              className="flex-row items-center justify-between border-t border-border pt-3"
            >
              <Text className="text-base font-semibold">{session.id.slice(0, 8)}</Text>
              <Text className="text-sm text-muted-foreground">
                inicio {new Date(session.startedAt).toLocaleTimeString()} · hace{' '}
                {Math.floor((loadedAt - session.startedAt) / 60000)} min
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Inicio de sesión (T09)">
          <Action
            icon={Play}
            label="1. Iniciar sesión con 2 mandos"
            onPress={() => onScenario('exito')}
          />
          <Action
            icon={Users}
            label="2. Pedir 6 mandos (insuficientes)"
            onPress={() => onScenario('mandos_insuficientes')}
          />
          <Action
            icon={TriangleAlert}
            label="3. Iniciar en consola ocupada"
            onPress={() => onScenario('consola_ocupada')}
          />
        </Section>

        <Section title="Alertas y datos de prueba">
          <Action
            icon={Zap}
            label="4. Sesión con 6 min restantes (alertas)"
            onPress={onNearlyDue}
          />
          <Action
            icon={Database}
            label="Crear sesión de prueba (6 min restantes)"
            onPress={onCreate}
          />
        </Section>

        <View className="gap-2">
          <Action icon={Square} label="Finalizar sesiones activas" onPress={onFinish} />
          <Action icon={RefreshCw} label="Recargar" onPress={reload} />
        </View>

        {message ? (
          <View
            accessibilityLiveRegion="polite"
            className="rounded-2xl border border-border bg-card p-4"
          >
            <Text className="text-base font-semibold">{message}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <View className="min-w-[45%] grow gap-1 rounded-2xl border border-border bg-raised p-3">
      <Text className="text-2xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
        {value ?? '…'}
      </Text>
      <Text className="text-xs font-bold text-muted-foreground">{label}</Text>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: Parameters<typeof Icon>[0]['as'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Button variant="secondary" onPress={onPress} className="h-12 justify-start gap-3 px-4">
      <Icon as={icon} size={18} className="text-muted-foreground" />
      <Text className="text-base font-semibold">{label}</Text>
    </Button>
  );
}
