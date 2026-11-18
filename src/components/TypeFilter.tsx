import { Pressable, ScrollView, Text } from 'react-native';

import { CONSOLE_TYPES, type ConsoleType } from '../db/schema/enums';
import { useWallFilterStore } from '../stores/wallFilterStore';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';

const OPTIONS: { value: ConsoleType | null; label: string }[] = [
  { value: null, label: 'Todas' },
  ...CONSOLE_TYPES.map((value) => ({ value, label: CONSOLE_TYPE_LABELS[value] })),
];

// Filtro por tipo de consola en la parte superior del muro.
export function TypeFilter() {
  const selected = useWallFilterStore((s) => s.consoleType);
  const setConsoleType = useWallFilterStore((s) => s.setConsoleType);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setConsoleType(option.value)}
            className={`min-h-12 justify-center rounded-full border px-5 ${
              active ? 'border-primary bg-primary' : 'border-line bg-surface'
            }`}
          >
            <Text className={`text-base font-semibold ${active ? 'text-white' : 'text-ink'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
