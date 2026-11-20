import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Hourglass, Play, Timer, type LucideIcon } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import { ChoiceButton } from '../../src/components/ChoiceButton';
import { EstimatedTotal } from '../../src/components/EstimatedTotal';
import { FormScrollView } from '../../src/components/FormScrollView';
import { PlatformBadge } from '../../src/components/PlatformBadge';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Section } from '../../src/components/Section';
import { Button } from '../../src/components/ui/button';
import { Icon } from '../../src/components/ui/icon';
import { Text } from '../../src/components/ui/text';
import { MAX_CONTROLLERS, type SessionMode, SESSION_MODES } from '../../src/db/schema/enums';
import { useBottomInset } from '../../src/hooks/useBottomInset';
import { useConsoles } from '../../src/hooks/useConsoles';
import { useRateBlocks } from '../../src/hooks/useRateBlocks';
import { useStartSession } from '../../src/hooks/useStartSession';
import { type StartSessionInput, startSessionSchema } from '../../src/schemas/session';
import type { ConsoleWithStock } from '../../src/services/consoleService';
import { SESSION_MODE_LABELS } from '../../src/utils/sessionLabels';

const CONTROLLER_OPTIONS = Array.from({ length: MAX_CONTROLLERS }, (_, i) => i + 1);

const MODE_ICONS: Record<SessionMode, LucideIcon> = {
  fijo_30: Timer,
  fijo_60: Timer,
  fijo_120: Timer,
  libre: Hourglass,
};

type Problem = Pick<StartSessionInput, 'controllerCount' | 'mode'> & {
  message: string;
  alternatives: ConsoleWithStock[];
};

// Diálogo de configuración de sesión (HU-001, T08). Llega con 1 mando y 1 hora elegidos, así
// que iniciar una sesión toma 2 toques: la tarjeta y "Iniciar sesión" (RNF-02). El botón queda
// fijo abajo para que siempre esté a la vista.
export default function SessionDialogScreen() {
  const { consoleId } = useLocalSearchParams<{ consoleId: string }>();
  const router = useRouter();
  const bottomInset = useBottomInset();
  const { data: consoles } = useConsoles();
  const startSession = useStartSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const console = consoles?.find((c) => c.id === consoleId);
  const { data: rates } = useRateBlocks(console?.consoleType);

  const { control, handleSubmit } = useForm<StartSessionInput>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: { consoleId, controllerCount: 1, mode: 'fijo_60' },
  });
  const [controllerCount, mode] = useWatch({ control, name: ['controllerCount', 'mode'] });
  // El aviso de un intento anterior deja de valer en cuanto cambian los mandos o la modalidad.
  const visibleProblem =
    problem && problem.controllerCount === controllerCount && problem.mode === mode
      ? problem
      : null;

  const onSubmit = handleSubmit(async (input) => {
    setProblem(null);
    const result = await startSession.mutateAsync(input);
    if (result.ok) {
      router.back();
    } else if (result.reason === 'mandos_insuficientes') {
      setProblem({ ...input, message: result.message, alternatives: result.alternatives });
    } else {
      setProblem({ ...input, message: result.message, alternatives: [] });
    }
  });

  if (!console) {
    return null;
  }

  // Escenario 3: una consola en juego, en mantenimiento o averiada no admite otra sesión (RN-06).
  if (console.status !== 'disponible') {
    const reason =
      console.status === 'en_juego'
        ? 'está en juego'
        : console.status === 'averiado'
          ? 'está averiada'
          : 'está en mantenimiento';
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Consola ocupada" onClose={() => router.back()} />
        <View className="gap-6 p-4">
          <View className="gap-2 rounded-3xl border border-playing/40 bg-playing-soft p-5">
            <Icon as={CircleAlert} size={26} className="text-playing-tone" />
            <Text className="text-xl font-extrabold">
              {console.name} {reason}
            </Text>
            <Text className="text-base text-muted-foreground">
              No se puede iniciar otra sesión en ella.
            </Text>
          </View>
          <Button variant="outline" onPress={() => router.back()} className="h-14 rounded-2xl">
            <Text className="text-lg font-bold">Volver al muro</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Nueva sesión"
        subtitle="Elige los mandos y la modalidad"
        onClose={() => router.back()}
      />
      <FormScrollView>
        <View className="flex-row items-center gap-3">
          <PlatformBadge consoleType={console.consoleType} />
          <Text className="text-2xl font-extrabold tracking-tight">{console.name}</Text>
        </View>
        <Section title="Mandos" trailing={`${console.operationalControllers} libres`}>
          <Controller
            control={control}
            name="controllerCount"
            render={({ field }) => (
              <View className="flex-row gap-2">
                {CONTROLLER_OPTIONS.map((count) => (
                  <View key={count} className="flex-1">
                    <ChoiceButton
                      testID={`mandos-${count}`}
                      label={String(count)}
                      selected={field.value === count}
                      onPress={() => field.onChange(count)}
                    />
                  </View>
                ))}
              </View>
            )}
          />
        </Section>

        <Section title="Modalidad">
          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <View className="flex-row flex-wrap gap-2">
                {SESSION_MODES.map((option) => (
                  <View key={option} className="basis-[48%] grow">
                    <ChoiceButton
                      testID={`modalidad-${option}`}
                      icon={MODE_ICONS[option]}
                      label={SESSION_MODE_LABELS[option]}
                      hint={option === 'libre' ? 'Se cobra al cerrar' : 'Tiempo fijo'}
                      selected={field.value === option}
                      onPress={() => field.onChange(option)}
                    />
                  </View>
                ))}
              </View>
            )}
          />
        </Section>

        <EstimatedTotal
          consoleType={console.consoleType}
          mode={mode}
          controllerCount={controllerCount}
          rates={rates}
        />

        {visibleProblem ? (
          <View
            accessibilityLiveRegion="polite"
            className="gap-3 rounded-3xl border border-playing/40 bg-playing-soft p-5"
          >
            <View className="flex-row items-center gap-2">
              <Icon as={CircleAlert} size={20} className="text-playing-tone" />
              <Text className="flex-1 text-lg font-bold">{visibleProblem.message}</Text>
            </View>
            {visibleProblem.alternatives.length > 0 ? (
              <>
                <Text className="text-base text-muted-foreground">
                  Consolas con mandos suficientes:
                </Text>
                {visibleProblem.alternatives.map((alternative) => (
                  <Button
                    key={alternative.id}
                    variant="outline"
                    onPress={() =>
                      router.replace({
                        pathname: '/sesion/[consoleId]',
                        params: { consoleId: alternative.id },
                      })
                    }
                    className="h-auto min-h-12 justify-start px-4"
                  >
                    <Text className="font-semibold">
                      {alternative.name} · {alternative.operationalControllers} mandos libres
                    </Text>
                  </Button>
                ))}
              </>
            ) : null}
          </View>
        ) : null}
      </FormScrollView>

      <View
        className="border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: bottomInset + 12 }}
      >
        <Button
          testID="iniciar-sesion"
          size="lg"
          disabled={startSession.isPending}
          onPress={() => onSubmit()}
          className="h-16 rounded-2xl"
        >
          <Icon as={Play} size={20} className="text-primary-foreground" />
          <Text className="text-xl font-bold">Iniciar sesión</Text>
        </Button>
      </View>
    </View>
  );
}
