import { ChevronRight, Wallet, Wrench, type LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { HealthOverview } from '../../src/components/HealthOverview';
import { PressableScale } from '../../src/components/PressableScale';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { WallSummary } from '../../src/components/WallSummary';
import { useCardStates } from '../../src/hooks/useCardStates';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useMaintenanceStatus } from '../../src/hooks/useMaintenance';
import { usePressOnce } from '../../src/hooks/usePressOnce';
import { useShiftOverview } from '../../src/hooks/useShift';
import { calculateBalance } from '../../src/services/balance';
import { consoleLight, controllerLight } from '../../src/services/health';
import { formatMoney } from '../../src/utils/formatMoney';

// Resumen del local de un vistazo: cuántas consolas hay en cada estado, lo cobrado en el turno y
// la salud de los equipos. Antes estos conteos estaban en el muro y en Salud y los hacían pesados;
// aquí se reúnen y cada bloque lleva a su pestaña.
export default function SummaryScreen() {
  const router = useRouter();
  const once = usePressOnce();
  const states = useCardStates();
  const { data: overview } = useShiftOverview();
  const { data: equipment } = useEquipment();
  const maintenanceDue = useMaintenanceStatus().filter((m) => m.due).length;

  const balance = calculateBalance(overview?.payments ?? [], 0);
  const sessionCount = new Set((overview?.payments ?? []).map((p) => p.sessionId)).size;
  const lights = (equipment ?? []).flatMap((c) => [
    consoleLight(c.status),
    ...c.controllers.map((m) => controllerLight(m.status)),
  ]);
  const attention = states.filter(
    (s) => s === 'por_terminar' || s === 'tiempo_cumplido' || s === 'por_cobrar',
  ).length;

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Resumen"
        subtitle={
          attention > 0
            ? `${attention} ${attention === 1 ? 'consola pide' : 'consolas piden'} atención`
            : 'Todo en orden'
        }
      />
      <ScrollView contentContainerClassName="gap-5 p-4 pb-8">
        <Block title="Consolas">
          <WallSummary states={states} />
        </Block>

        <Block title="Turno">
          <LinkCard
            icon={Wallet}
            title={overview?.shift ? formatMoney(balance.totalCents) : 'Sin turno abierto'}
            hint={
              overview?.shift
                ? `${sessionCount === 1 ? '1 sesión cobrada' : `${sessionCount} sesiones cobradas`} · ver Caja`
                : 'El próximo cobro abre un turno'
            }
            onPress={once(() => router.push('/caja'))}
          />
        </Block>

        <Block title="Salud de los equipos">
          <HealthOverview lights={lights} />
          {maintenanceDue > 0 ? (
            <LinkCard
              icon={Wrench}
              warn
              title={
                maintenanceDue === 1
                  ? '1 mantenimiento pendiente'
                  : `${maintenanceDue} mantenimientos pendientes`
              }
              hint="Ver en Salud"
              onPress={once(() => router.push('/salud'))}
            />
          ) : null}
        </Block>
      </ScrollView>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text accessibilityRole="header" className="px-1 text-base font-extrabold">
        {title}
      </Text>
      {children}
    </View>
  );
}

function LinkCard({
  icon,
  title,
  hint,
  warn,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  warn?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <View
        className={
          warn
            ? 'h-11 w-11 items-center justify-center rounded-xl bg-warning-soft'
            : 'h-11 w-11 items-center justify-center rounded-xl bg-secondary'
        }
      >
        <Icon as={icon} size={22} className={warn ? 'text-warning-tone' : 'text-foreground'} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xl font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm font-semibold text-muted-foreground">{hint}</Text>
      </View>
      <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
    </PressableScale>
  );
}
