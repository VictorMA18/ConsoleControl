import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { ChoiceButton } from '../../src/components/ChoiceButton';
import { EstimatedTotal } from '../../src/components/EstimatedTotal';
import { Button } from '../../src/components/ui/button';
import { Card } from '../../src/components/ui/card';
import { Text } from '../../src/components/ui/text';
import { MAX_CONTROLLERS, SESSION_MODES } from '../../src/db/schema/enums';
import { useBottomInset } from '../../src/hooks/useBottomInset';
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

  // Escenario 3: una consola en juego o en mantenimiento no admite otra sesión.
  if (console.status !== 'disponible') {
    const reason = console.status === 'en_juego' ? 'está en juego' : 'está en mantenimiento';
    return (
      <View className="flex-1 gap-6 bg-background p-5">
        <Stack.Screen options={{ title: console.name }} />
        <View className="rounded-xl bg-playing-soft p-4">
          <Text className="text-xl font-bold">
            {console.name} {reason}
          </Text>
          <Text className="mt-1">No se puede iniciar otra sesión en ella.</Text>
        </View>
        <Button
          variant="outline"
          onPress={() => router.back()}
          className="h-auto min-h-14 rounded-xl border-2"
        >
          <Text className="text-lg font-bold">Volver al muro</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: `Nueva sesión · ${console.name}` }} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        <Card className="gap-3 px-4 py-4">
          <Text variant="large">Mandos</Text>
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
          <Text className="text-base text-muted-foreground">
            {console.operationalControllers} mandos libres en esta consola
          </Text>
        </Card>

        <Card className="gap-3 px-4 py-4">
          <Text variant="large">Modalidad</Text>
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
        </Card>

        <EstimatedTotal
          consoleType={console.consoleType}
          mode={mode}
          controllerCount={controllerCount}
          rates={rates}
        />

        {visibleProblem ? (
          <View accessibilityLiveRegion="polite" className="gap-3 rounded-xl bg-playing-soft p-4">
            <Text className="text-lg font-bold">{visibleProblem.message}</Text>
            {visibleProblem.alternatives.length > 0 ? (
              <>
                <Text>Consolas con mandos suficientes:</Text>
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
                    <Text className="font-semibold text-primary">
                      {alternative.name} · {alternative.operationalControllers} mandos libres
                    </Text>
                  </Button>
                ))}
              </>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: Math.max(bottomInset, 12) }}
      >
        <Button
          testID="iniciar-sesion"
          size="lg"
          disabled={startSession.isPending}
          onPress={() => onSubmit()}
          className="h-16 rounded-xl"
        >
          <Text className="text-xl font-bold">Iniciar sesión</Text>
        </Button>
      </View>
    </View>
  );
}
