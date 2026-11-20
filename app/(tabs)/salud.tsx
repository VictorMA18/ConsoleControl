import {
  BellRing,
  ChevronRight,
  Clock3,
  Gamepad2,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { CONSOLE_HEALTH_LABELS } from '../../src/components/HealthControls';
import { HealthLightBadge } from '../../src/components/HealthLightBadge';
import { PlatformBadge } from '../../src/components/PlatformBadge';
import { PressableScale } from '../../src/components/PressableScale';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SearchField } from '../../src/components/SearchField';
import { StateView } from '../../src/components/StateView';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useMaintenanceStatus } from '../../src/hooks/useMaintenance';
import { usePressOnce } from '../../src/hooks/usePressOnce';
import { consoleLight, formatUsage, type HealthLight } from '../../src/services/health';
import type { EquipmentConsole } from '../../src/services/healthService';
import { MAINTENANCE_LABELS, type MaintenanceStatus } from '../../src/services/maintenanceAlerts';
import { matchesQuery } from '../../src/stores/wallFilterStore';
import { cn } from '../../src/utils/cn';

type Filter = 'todas' | 'alertas' | 'ambar' | 'rojo';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'alertas', label: 'Con avisos' },
  { value: 'ambar', label: 'Mantenimiento' },
  { value: 'rojo', label: 'Averiadas' },
];

// Semáforo de salud (HU-012, CU-004) y mantenimiento preventivo (HU-014). La lista es compacta:
// una fila por máquina con su estado y sus avisos, filtros y buscador. Tocar una fila abre su
// detalle (app/salud/[consoleId].tsx), donde se cambia el estado y se registra el mantenimiento.
export default function HealthScreen() {
  const router = useRouter();
  const once = usePressOnce();
  const { data: equipment, isPending, error } = useEquipment();
  const maintenance = useMaintenanceStatus();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const rows = (equipment ?? []).map((console) => {
    const out = console.controllers.filter(
      (m) => m.status === 'mantenimiento' || m.status === 'averiado',
    ).length;
    const own = maintenance.filter((m) => m.consoleId === console.id);
    const due = own.some((m) => m.due);
    // El mantenimiento más cercano a su umbral, para mostrar «Limpieza en 12 h» o «vencida».
    const next = [...own].sort(
      (a, b) => a.thresholdMinutes - a.minutesSince - (b.thresholdMinutes - b.minutesSince),
    )[0];
    return { console, out, due, next, light: consoleLight(console.status) };
  });
  const visible = rows.filter(
    (row) =>
      matchesQuery(row.console.name, query) &&
      (filter === 'todas' ||
        (filter === 'alertas' && (row.due || row.out > 0 || row.light !== 'verde')) ||
        row.light === filter),
  );
  const dueCount = maintenance.filter((m) => m.due).length;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Salud"
        subtitle={
          equipment
            ? `${equipment.length} máquinas · ${equipment.reduce((n, c) => n + c.controllers.length, 0)} mandos`
            : 'Semáforo de consolas y mandos'
        }
      />
      {isPending ? (
        <StateView kind="loading" message="Cargando equipos…" />
      ) : error ? (
        <StateView kind="error" message="No se pudo leer el inventario." />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="gap-4 p-4 pb-8"
        >
          {dueCount > 0 ? (
            <Pressable
              testID="alertas-mantenimiento"
              accessibilityRole="button"
              onPress={() => setFilter('alertas')}
              className="flex-row items-center gap-3 rounded-2xl bg-warning-soft px-4 py-3 active:opacity-80"
            >
              <Icon as={BellRing} size={20} className="text-warning-tone" />
              <Text className="flex-1 text-sm font-bold text-warning-tone">
                {dueCount === 1
                  ? '1 mantenimiento preventivo pendiente'
                  : `${dueCount} mantenimientos preventivos pendientes`}
              </Text>
              <Text className="text-sm font-semibold text-warning-tone">Ver</Text>
            </Pressable>
          ) : null}

          <View className="gap-3">
            <SearchField
              testID="buscar-salud"
              accessibilityLabel="Buscar máquina en Salud"
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar máquina, por ejemplo 3"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {FILTERS.map((option) => {
                const active = option.value === filter;
                return (
                  <Pressable
                    key={option.value}
                    testID={`filtro-salud-${option.value}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(option.value)}
                    className={cn(
                      'h-10 justify-center rounded-full border px-4 active:opacity-80',
                      active ? 'border-primary bg-primary' : 'border-border bg-card',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-bold',
                        active ? 'text-primary-foreground' : 'text-foreground',
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {visible.length === 0 ? (
            <StateView
              kind="empty"
              message={query ? `No hay ninguna máquina «${query}».` : 'Nada en este filtro.'}
            />
          ) : (
            <View className="gap-3">
              {visible.map((row) => (
                <Animated.View key={row.console.id} layout={LinearTransition.duration(200)}>
                  <HealthRow
                    {...row}
                    onPress={once(() =>
                      router.push({
                        pathname: '/salud/[consoleId]',
                        params: { consoleId: row.console.id },
                      }),
                    )}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Una tarjeta por máquina: plataforma, nombre y estado arriba; abajo, horas de uso, mandos
// operativos y el próximo mantenimiento. Toda la tarjeta abre el detalle.
function HealthRow({
  console,
  out,
  due,
  next,
  light,
  onPress,
}: {
  console: EquipmentConsole;
  out: number;
  due: boolean;
  next: MaintenanceStatus | undefined;
  light: HealthLight;
  onPress: () => void;
}) {
  const operative = console.controllers.length - out;
  const nextLabel = next
    ? next.due
      ? `${MAINTENANCE_LABELS[next.kind]} vencida`
      : `${MAINTENANCE_LABELS[next.kind]} en ${formatUsage(next.thresholdMinutes - next.minutesSince)}`
    : null;
  return (
    <PressableScale
      testID={`salud-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${CONSOLE_HEALTH_LABELS[console.status]}${due ? ', mantenimiento pendiente' : ''}${out > 0 ? `, ${out} mandos fuera de servicio` : ''}`}
      onPress={onPress}
      className="gap-3 rounded-3xl border border-border bg-card p-4"
    >
      <View className="flex-row items-center gap-2.5">
        <PlatformBadge consoleType={console.consoleType} compact />
        <Text className="shrink text-lg font-extrabold" numberOfLines={1}>
          {console.name}
        </Text>
        <View className="flex-1" />
        <HealthLightBadge
          light={light}
          playing={console.status === 'en_juego'}
          label={CONSOLE_HEALTH_LABELS[console.status]}
        />
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </View>
      <View className="flex-row items-center gap-4">
        <Fact icon={Clock3} text={formatUsage(console.usageMinutes)} />
        <Fact icon={Gamepad2} text={`${operative}/${console.controllers.length}`} warn={out > 0} />
        {nextLabel ? <Fact icon={Wrench} text={nextLabel} warn={due} grow /> : null}
      </View>
    </PressableScale>
  );
}

function Fact({
  icon,
  text,
  warn,
  grow,
}: {
  icon: LucideIcon;
  text: string;
  warn?: boolean;
  grow?: boolean;
}) {
  return (
    <View className={cn('flex-row items-center gap-1.5', grow && 'shrink')}>
      <Icon as={icon} size={15} className={warn ? 'text-warning-tone' : 'text-muted-foreground'} />
      <Text
        numberOfLines={1}
        className={cn(
          'shrink text-sm font-semibold',
          warn ? 'text-warning-tone' : 'text-muted-foreground',
        )}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {text}
      </Text>
    </View>
  );
}
