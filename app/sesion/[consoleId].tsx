import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChoiceButton } from '../../src/components/ChoiceButton';
import { EstimatedTotal } from '../../src/components/EstimatedTotal';
import { MAX_CONTROLLERS, SESSION_MODES } from '../../src/db/schema/enums';
import { useConsoles } from '../../src/hooks/useConsoles';
import { useRateBlocks } from '../../src/hooks/useRateBlocks';
import { useStartSession } from '../../src/hooks/useStartSession';
import { type StartSessionInput, startSessionSchema } from '../../src/schemas/session';
import type { ConsoleWithStock } from '../../src/services/consoleService';
import { SESSION_MODE_LABELS } from '../../src/utils/sessionLabels';

const CONTROLLER_OPTIONS = Array.from({ length: MAX_CONTROLLERS }, (_, i) => i + 1);

type Problem = Pick<StartSessionInput, 'controllerCount' | 'mode'> & {
  message: string;
  alternatives: ConsoleWithStock[];
};

// Diálogo de configuración de sesión (HU-001, T08). Llega con 1 mando y 1 hora elegidos, así
// que iniciar una sesión toma 2 toques: la tarjeta y "Iniciar sesión" (RNF-02).
export default function SessionDialogScreen() {
  const { consoleId } = useLocalSearchParams<{ consoleId: string }>();
  const router = useRouter();
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

  // Escenario 3: una consola en juego o en mantenimiento no admite otra sesión.
  if (console.status !== 'disponible') {
    const reason = console.status === 'en_juego' ? 'está en juego' : 'está en mantenimiento';
    return (
      <View className="flex-1 gap-6 bg-surface p-5">
        <Stack.Screen options={{ title: console.name }} />
        <View className="rounded-xl bg-playing-soft p-4">
          <Text className="text-xl font-bold text-ink">
            {console.name} {reason}
          </Text>
          <Text className="mt-1 text-base text-ink">No se puede iniciar otra sesión en ella.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="min-h-14 items-center justify-center rounded-xl border-2 border-line"
        >
          <Text className="text-lg font-bold text-ink">Volver al muro</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-6 p-5">
      <Stack.Screen options={{ title: `Nueva sesión · ${console.name}` }} />

      <View className="gap-3">
        <Text className="text-lg font-bold text-ink">Mandos</Text>
        <Controller
          control={control}
          name="controllerCount"
          render={({ field }) => (
            <View className="flex-row gap-2">
              {CONTROLLER_OPTIONS.map((count) => (
                <ChoiceButton
                  key={count}
                  testID={`mandos-${count}`}
                  label={String(count)}
                  selected={field.value === count}
                  onPress={() => field.onChange(count)}
                />
              ))}
            </View>
          )}
        />
        <Text className="text-base text-muted">
          {console.operationalControllers} mandos libres en esta consola
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-lg font-bold text-ink">Modalidad</Text>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <View className="flex-row flex-wrap gap-2">
              {SESSION_MODES.map((mode) => (
                <View key={mode} className="basis-[48%]">
                  <ChoiceButton
                    testID={`modalidad-${mode}`}
                    label={SESSION_MODE_LABELS[mode]}
                    selected={field.value === mode}
                    onPress={() => field.onChange(mode)}
                  />
                </View>
              ))}
            </View>
          )}
        />
      </View>

      <EstimatedTotal
        consoleType={console.consoleType}
        mode={mode}
        controllerCount={controllerCount}
        rates={rates}
      />

      {visibleProblem ? (
        <View accessibilityLiveRegion="polite" className="gap-3 rounded-xl bg-playing-soft p-4">
          <Text className="text-lg font-bold text-ink">{visibleProblem.message}</Text>
          {visibleProblem.alternatives.length > 0 ? (
            <>
              <Text className="text-base text-ink">Consolas con mandos suficientes:</Text>
              {visibleProblem.alternatives.map((alternative) => (
                <Pressable
                  key={alternative.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.replace({
                      pathname: '/sesion/[consoleId]',
                      params: { consoleId: alternative.id },
                    })
                  }
                  className="min-h-12 justify-center rounded-lg border border-line bg-surface px-4"
                >
                  <Text className="text-base font-semibold text-primary">
                    {alternative.name} · {alternative.operationalControllers} mandos libres
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      <Pressable
        testID="iniciar-sesion"
        accessibilityRole="button"
        disabled={startSession.isPending}
        onPress={() => onSubmit()}
        className="min-h-16 items-center justify-center rounded-xl bg-primary active:bg-primary-pressed disabled:opacity-60"
      >
        <Text className="text-xl font-bold text-white">Iniciar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}
