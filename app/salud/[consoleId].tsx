import { Clock3, Gamepad2, Sparkles, Wrench } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import {
  CONSOLE_HEALTH_LABELS,
  CONTROLLER_HEALTH_LABELS,
  HealthSegmented,
} from '../../src/components/HealthControls';
import { HEALTH_LOOK, HealthLightBadge } from '../../src/components/HealthLightBadge';
import { MaintenancePanel } from '../../src/components/MaintenancePanel';
import { PlatformBadge } from '../../src/components/PlatformBadge';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
import { StateView } from '../../src/components/StateView';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { useChangeHealth, useEquipment } from '../../src/hooks/useEquipment';
import { useMaintenanceStatus, useRegisterMaintenance } from '../../src/hooks/useMaintenance';
import {
  canChangeConsoleHealth,
  canChangeControllerHealth,
  CONSOLE_HEALTH_STATUSES,
  type ConsoleHealthStatus,
  consoleLight,
  CONTROLLER_HEALTH_STATUSES,
  type ControllerHealthStatus,
  controllerLight,
  formatUsage,
} from '../../src/services/health';
import { MAINTENANCE_LABELS, type MaintenanceStatus } from '../../src/services/maintenanceAlerts';
import { cn } from '../../src/utils/cn';

type Change =
  | { kind: 'console'; id: string; status: ConsoleHealthStatus }
  | { kind: 'controller'; id: string; status: ControllerHealthStatus };

// Detalle de salud de una máquina (HU-012 y HU-014): su estado, sus horas de uso, cada mando y el
// mantenimiento preventivo. Se abre desde la lista de la pestaña Salud.
export default function HealthDetailScreen() {
  const { consoleId } = useLocalSearchParams<{ consoleId: string }>();
  const router = useRouter();
  const bottomInset = useBottomInset();
  const { data: equipment, isPending } = useEquipment();
  const changeHealth = useChangeHealth();
  const maintenance = useMaintenanceStatus();
  const registerMaintenance = useRegisterMaintenance();
  const [pending, setPending] = useState<Exclude<ConsoleHealthStatus, 'disponible'> | null>(null);
  const [servicing, setServicing] = useState<MaintenanceStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const console = equipment?.find((c) => c.id === consoleId);
  if (isPending) {
    return <StateView kind="loading" />;
  }
  if (!console) {
    return <StateView kind="error" message="La máquina no existe." />;
  }

  async function apply(change: Change) {
    setMessage(null);
    const result = await changeHealth.mutateAsync(change);
    if (!result.ok) {
      setMessage(result.message);
    }
  }

  // Sacar la consola de servicio pide confirmación; devolverla a operativa no.
  function chooseConsole(status: ConsoleHealthStatus) {
    if (!console || status === console.status) {
      return;
    }
    if (status === 'disponible') {
      void apply({ kind: 'console', id: console.id, status });
    } else {
      setPending(status);
    }
  }

  const editable = canChangeConsoleHealth(console.status);
  const statuses = maintenance.filter((m) => m.consoleId === console.id);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={console.name} subtitle="Salud del equipo" onBack={() => router.back()} />
      <ScrollView
        contentContainerClassName="gap-4 p-4"
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      >
        <View className="gap-4 rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-3">
            <PlatformBadge consoleType={console.consoleType} />
            <View className="flex-1" />
            <HealthLightBadge
              testID={`semaforo-${console.id}`}
              light={consoleLight(console.status)}
              playing={console.status === 'en_juego'}
              label={CONSOLE_HEALTH_LABELS[console.status]}
            />
          </View>
          <View className="flex-row items-center gap-2">
            <Icon as={Clock3} size={18} className="text-muted-foreground" />
            <Text className="text-base font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
              {formatUsage(console.usageMinutes)} de uso
            </Text>
          </View>
          <HealthSegmented
            testID={`estado-consola-${console.id}`}
            options={CONSOLE_HEALTH_STATUSES.map((status) => ({
              value: status,
              label: CONSOLE_HEALTH_LABELS[status],
            }))}
            selected={console.status}
            disabled={!editable || changeHealth.isPending}
            onChange={chooseConsole}
          />
          {!editable ? (
            <Text className="text-sm text-muted-foreground">
              En juego: finaliza y cobra la sesión para cambiar su estado.
            </Text>
          ) : null}
        </View>

        {message ? (
          <View accessibilityRole="alert" className="rounded-2xl bg-playing-soft p-4">
            <Text className="font-bold text-playing-tone">{message}</Text>
          </View>
        ) : null}

        <Section title="Mandos" trailing={`${console.controllers.length}`}>
          {console.controllers.map((controller, index) => {
            const light = controllerLight(controller.status);
            return (
              <View
                key={controller.id}
                className={cn('gap-2', index > 0 && 'border-t border-border pt-3')}
              >
                <View className="flex-row items-center gap-2">
                  <View className={cn('h-2.5 w-2.5 rounded-full', HEALTH_LOOK[light].dot)} />
                  <Icon as={Gamepad2} size={18} />
                  <Text className="flex-1 text-base font-bold">{controller.label}</Text>
                  <Text
                    className="text-sm text-muted-foreground"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {formatUsage(controller.usageMinutes)}
                  </Text>
                </View>
                {canChangeControllerHealth(controller.status) ? (
                  <HealthSegmented
                    compact
                    testID={`estado-mando-${controller.id}`}
                    options={CONTROLLER_HEALTH_STATUSES.map((status) => ({
                      value: status,
                      label: CONTROLLER_HEALTH_LABELS[status],
                    }))}
                    selected={controller.status}
                    disabled={changeHealth.isPending}
                    onChange={(status) =>
                      void apply({ kind: 'controller', id: controller.id, status })
                    }
                  />
                ) : (
                  <Text className="text-sm text-muted-foreground">En uso en una sesión.</Text>
                )}
              </View>
            );
          })}
        </Section>

        <View className="rounded-3xl border border-border bg-card px-5 pb-5">
          <MaintenancePanel
            statuses={statuses}
            disabled={registerMaintenance.isPending}
            onRegister={setServicing}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={pending !== null}
        icon={Wrench}
        title={pending === 'averiado' ? 'Reportar falla' : 'Poner en mantenimiento'}
        message={`${console.name} quedará fuera de servicio y no se podrá iniciar una sesión en ella hasta volver a operativa.`}
        confirmLabel={pending === 'averiado' ? 'Reportar' : 'Confirmar'}
        onConfirm={() => {
          if (pending) {
            void apply({ kind: 'console', id: console.id, status: pending });
          }
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        visible={servicing !== null}
        icon={Sparkles}
        title="Registrar mantenimiento"
        message={`¿Se hizo la ${servicing ? MAINTENANCE_LABELS[servicing.kind].toLowerCase() : ''} de ${console.name}? El contador de este mantenimiento vuelve a cero; las horas de uso totales se conservan.`}
        confirmLabel="Registrar"
        onConfirm={() => {
          if (servicing) {
            void registerMaintenance
              .mutateAsync({ consoleId: servicing.consoleId, kind: servicing.kind })
              .then((result) => setMessage(result.ok ? null : result.message));
          }
          setServicing(null);
        }}
        onCancel={() => setServicing(null)}
      />
    </View>
  );
}
