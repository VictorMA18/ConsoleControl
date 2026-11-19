import { Clock3, Gamepad2, Wrench, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { HEALTH_LOOK, HealthLightBadge } from '../../src/components/HealthLightBadge';
import { PlatformBadge } from '../../src/components/PlatformBadge';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StateView } from '../../src/components/StateView';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import type { ConsoleStatus, ControllerStatus } from '../../src/db/schema/enums';
import { useChangeHealth, useEquipment } from '../../src/hooks/useEquipment';
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
  type HealthLight,
} from '../../src/services/health';
import type { EquipmentConsole } from '../../src/services/healthService';
import { cn } from '../../src/utils/cn';

const CONSOLE_LABELS: Record<ConsoleStatus, string> = {
  disponible: 'Operativa',
  en_juego: 'En juego',
  mantenimiento: 'Mantenimiento',
  averiado: 'Averiada',
};

const CONTROLLER_LABELS: Record<ControllerStatus, string> = {
  operativo: 'Operativo',
  en_uso: 'En uso',
  mantenimiento: 'Mantenimiento',
  averiado: 'Averiado',
};

const LIGHT_OF_OPTION: Record<ConsoleHealthStatus | ControllerHealthStatus, HealthLight> = {
  disponible: 'verde',
  operativo: 'verde',
  mantenimiento: 'ambar',
  averiado: 'rojo',
};

type PendingChange = {
  console: EquipmentConsole;
  status: Exclude<ConsoleHealthStatus, 'disponible'>;
};

// Semáforo de salud (HU-012, CU-004): estado y horas de uso de cada consola y mando. Lo que está
// en mantenimiento o averiado queda fuera de la asignación al iniciar una sesión (RN-06).
export default function HealthScreen() {
  const { data: equipment, isPending, error } = useEquipment();
  const changeHealth = useChangeHealth();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function apply(
    change:
      | { kind: 'console'; id: string; status: ConsoleHealthStatus }
      | { kind: 'controller'; id: string; status: ControllerHealthStatus },
  ) {
    setMessage(null);
    const result = await changeHealth.mutateAsync(change);
    if (!result.ok) {
      setMessage(result.message);
    }
  }

  // Sacar una consola de servicio pide confirmación; devolverla a operativa no.
  function chooseConsole(console: EquipmentConsole, status: ConsoleHealthStatus) {
    if (status === console.status) {
      return;
    }
    if (status === 'disponible') {
      void apply({ kind: 'console', id: console.id, status });
    } else {
      setPending({ console, status });
    }
  }

  const lights = (equipment ?? []).flatMap((c) => [
    consoleLight(c.status),
    ...c.controllers.map((m) => controllerLight(m.status)),
  ]);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Salud" subtitle="Semáforo de consolas y mandos" />
      {isPending ? (
        <StateView kind="loading" message="Cargando equipos…" />
      ) : error ? (
        <StateView kind="error" message="No se pudo leer el inventario." />
      ) : (
        <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
          <View className="flex-row gap-2">
            <Count
              light="verde"
              label="Operativos"
              total={lights.filter((l) => l === 'verde').length}
            />
            <Count
              light="ambar"
              label="Mantenimiento"
              total={lights.filter((l) => l === 'ambar').length}
            />
            <Count
              light="rojo"
              label="Averiados"
              total={lights.filter((l) => l === 'rojo').length}
            />
          </View>

          {message ? (
            <View accessibilityRole="alert" className="rounded-2xl bg-playing-soft p-4">
              <Text className="font-bold text-playing-tone">{message}</Text>
            </View>
          ) : null}

          {(equipment ?? []).map((console) => {
            const editable = canChangeConsoleHealth(console.status);
            return (
              <View
                key={console.id}
                testID={`salud-${console.id}`}
                className="gap-4 rounded-3xl border border-border bg-card p-5"
              >
                <View className="flex-row items-center gap-3">
                  <PlatformBadge consoleType={console.consoleType} />
                  <Text className="flex-1 text-xl font-extrabold" numberOfLines={1}>
                    {console.name}
                  </Text>
                  <HealthLightBadge
                    testID={`semaforo-${console.id}`}
                    light={consoleLight(console.status)}
                    label={CONSOLE_LABELS[console.status]}
                  />
                </View>
                <UsageRow icon={Clock3} minutes={console.usageMinutes} />

                <Segmented
                  options={CONSOLE_HEALTH_STATUSES.map((status) => ({
                    value: status,
                    label: CONSOLE_LABELS[status],
                  }))}
                  selected={console.status}
                  disabled={!editable || changeHealth.isPending}
                  onChange={(status) => chooseConsole(console, status)}
                  testID={`estado-consola-${console.id}`}
                />
                {!editable ? (
                  <Text className="text-sm text-muted-foreground">
                    En juego: finaliza y cobra la sesión para cambiar su estado.
                  </Text>
                ) : null}

                <View className="gap-3 border-t border-border pt-4">
                  <Text className="text-sm font-bold text-muted-foreground">
                    Mandos ({console.controllers.length})
                  </Text>
                  {console.controllers.map((controller) => {
                    const light = controllerLight(controller.status);
                    return (
                      <View key={controller.id} className="gap-2">
                        <View className="flex-row items-center gap-2">
                          <View
                            className={cn('h-2.5 w-2.5 rounded-full', HEALTH_LOOK[light].dot)}
                          />
                          <Icon as={Gamepad2} size={18} />
                          <Text className="flex-1 text-base font-bold">{controller.label}</Text>
                          <Text className="text-sm text-muted-foreground">
                            {formatUsage(controller.usageMinutes)}
                          </Text>
                        </View>
                        {canChangeControllerHealth(controller.status) ? (
                          <Segmented
                            compact
                            options={CONTROLLER_HEALTH_STATUSES.map((status) => ({
                              value: status,
                              label: CONTROLLER_LABELS[status],
                            }))}
                            selected={controller.status}
                            disabled={changeHealth.isPending}
                            onChange={(status) =>
                              void apply({ kind: 'controller', id: controller.id, status })
                            }
                            testID={`estado-mando-${controller.id}`}
                          />
                        ) : (
                          <Text className="text-sm text-muted-foreground">
                            En uso en una sesión.
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <ConfirmDialog
        visible={pending !== null}
        icon={Wrench}
        title={pending?.status === 'averiado' ? 'Reportar falla' : 'Poner en mantenimiento'}
        message={`${pending?.console.name ?? ''} quedará fuera de servicio y no se podrá iniciar una sesión en ella hasta volver a operativa.`}
        confirmLabel={pending?.status === 'averiado' ? 'Reportar' : 'Confirmar'}
        onConfirm={() => {
          if (pending) {
            void apply({ kind: 'console', id: pending.console.id, status: pending.status });
          }
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </View>
  );
}

function Count({ light, label, total }: { light: HealthLight; label: string; total: number }) {
  const look = HEALTH_LOOK[light];
  return (
    <View
      accessibilityLabel={`${total} ${label}`}
      className="flex-1 gap-1 rounded-2xl border border-border bg-card p-3"
    >
      <View className="flex-row items-center gap-1.5">
        <View className={cn('h-2.5 w-2.5 rounded-full', look.dot)} />
        <Text className="text-2xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
          {total}
        </Text>
      </View>
      <Text numberOfLines={1} className="text-xs font-bold text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

function UsageRow({ icon, minutes }: { icon: LucideIcon; minutes: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon as={icon} size={18} className="text-muted-foreground" />
      <Text className="text-base font-semibold">{formatUsage(minutes)} de uso</Text>
    </View>
  );
}

function Segmented<T extends ConsoleHealthStatus | ControllerHealthStatus>({
  options,
  selected,
  disabled,
  onChange,
  compact,
  testID,
}: {
  options: { value: T; label: string }[];
  selected: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  compact?: boolean;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      className={cn('flex-row gap-1 rounded-2xl bg-secondary p-1', disabled && 'opacity-50')}
    >
      {options.map(({ value, label }) => {
        const active = value === selected;
        const look = HEALTH_LOOK[LIGHT_OF_OPTION[value]];
        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            onPress={() => onChange(value)}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl',
              compact ? 'h-9' : 'h-11',
              active ? 'border border-border bg-card' : 'active:bg-accent',
            )}
          >
            {active ? <View className={cn('h-2 w-2 rounded-full', look.dot)} /> : null}
            <Text
              numberOfLines={1}
              className={cn(
                compact ? 'text-xs' : 'text-sm',
                'font-bold',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
