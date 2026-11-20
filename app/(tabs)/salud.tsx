import { BellRing, ChevronRight, Gamepad2, Wrench } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { CONSOLE_HEALTH_LABELS } from '../../src/components/HealthControls';
import { HEALTH_LOOK } from '../../src/components/HealthLightBadge';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SearchField } from '../../src/components/SearchField';
import { StateView } from '../../src/components/StateView';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useMaintenanceStatus } from '../../src/hooks/useMaintenance';
import {
  consoleLight,
  controllerLight,
  formatUsage,
  type HealthLight,
} from '../../src/services/health';
import type { EquipmentConsole } from '../../src/services/healthService';
import { matchesQuery } from '../../src/stores/wallFilterStore';
import { cn } from '../../src/utils/cn';
import { CONSOLE_TYPE_LABELS } from '../../src/utils/consoleLabels';

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
  const { data: equipment, isPending, error } = useEquipment();
  const maintenance = useMaintenanceStatus();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const rows = (equipment ?? []).map((console) => {
    const out = console.controllers.filter(
      (m) => m.status === 'mantenimiento' || m.status === 'averiado',
    ).length;
    const due = maintenance.some((m) => m.consoleId === console.id && m.due);
    return { console, out, due, light: consoleLight(console.status) };
  });
  const visible = rows.filter(
    (row) =>
      matchesQuery(row.console.name, query) &&
      (filter === 'todas' ||
        (filter === 'alertas' && (row.due || row.out > 0 || row.light !== 'verde')) ||
        row.light === filter),
  );
  const lights = (equipment ?? []).flatMap((c) => [
    consoleLight(c.status),
    ...c.controllers.map((m) => controllerLight(m.status)),
  ]);
  const dueCount = maintenance.filter((m) => m.due).length;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Salud" subtitle="Semáforo de consolas y mandos" />
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
          <HealthOverview lights={lights} />

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
            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              {visible.map((row, index) => (
                <Animated.View key={row.console.id} layout={LinearTransition.duration(200)}>
                  <HealthRow
                    {...row}
                    first={index === 0}
                    onPress={() =>
                      router.push({
                        pathname: '/salud/[consoleId]',
                        params: { consoleId: row.console.id },
                      })
                    }
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

// Una fila por máquina: estado, tipo y horas a la izquierda; avisos y flecha a la derecha.
function HealthRow({
  console,
  out,
  due,
  light,
  first,
  onPress,
}: {
  console: EquipmentConsole;
  out: number;
  due: boolean;
  light: HealthLight;
  first: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`salud-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${CONSOLE_HEALTH_LABELS[console.status]}${due ? ', mantenimiento pendiente' : ''}${out > 0 ? `, ${out} mandos fuera de servicio` : ''}`}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 px-4 py-3.5 active:bg-accent',
        !first && 'border-t border-border',
      )}
    >
      <View className={cn('h-2.5 w-2.5 rounded-full', HEALTH_LOOK[light].dot)} />
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-extrabold">{console.name}</Text>
        <Text
          className="text-xs font-semibold text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {CONSOLE_TYPE_LABELS[console.consoleType]} · {CONSOLE_HEALTH_LABELS[console.status]} ·{' '}
          {formatUsage(console.usageMinutes)}
        </Text>
      </View>
      {out > 0 ? (
        <View className="flex-row items-center gap-1 rounded-full bg-warning-soft px-2 py-1">
          <Icon as={Gamepad2} size={13} className="text-warning-tone" />
          <Text className="text-xs font-bold text-warning-tone">{out}</Text>
        </View>
      ) : null}
      {due ? (
        <View className="rounded-full bg-warning-soft p-1.5">
          <Icon as={Wrench} size={13} className="text-warning-tone" />
        </View>
      ) : null}
      <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
    </Pressable>
  );
}

// Conteo de equipos (consolas y mandos) por color del semáforo, con el mismo lenguaje que el
// resumen del muro: una tarjeta, una barra de proporción y columnas separadas por líneas finas.
function HealthOverview({ lights }: { lights: HealthLight[] }) {
  const columns: { light: HealthLight; label: string }[] = [
    { light: 'verde', label: 'Operativos' },
    { light: 'ambar', label: 'Mantenimiento' },
    { light: 'rojo', label: 'Averiados' },
  ];
  const totals = columns.map((c) => ({ ...c, total: lights.filter((l) => l === c.light).length }));
  return (
    <View
      accessibilityRole="summary"
      className="overflow-hidden rounded-3xl border border-border bg-card"
    >
      <View className="h-1.5 flex-row bg-secondary">
        {totals.map((c) =>
          c.total > 0 ? (
            <View key={c.light} className={HEALTH_LOOK[c.light].dot} style={{ flex: c.total }} />
          ) : null,
        )}
      </View>
      <View className="flex-row">
        {totals.map((c, index) => (
          <View
            key={c.light}
            accessibilityLabel={`${c.total} ${c.label}`}
            className={cn('flex-1 gap-1 px-3 py-3', index > 0 && 'border-l border-border')}
          >
            <Text
              className={cn('text-2xl font-extrabold', c.total === 0 && 'text-muted-foreground')}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {c.total}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className={cn('h-1.5 w-1.5 rounded-full', HEALTH_LOOK[c.light].dot)} />
              <Text
                numberOfLines={1}
                className="flex-1 text-[11px] font-bold text-muted-foreground"
              >
                {c.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
