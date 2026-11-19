import { ScrollView } from 'react-native';

import { CONSOLE_TYPES, type ConsoleType } from '../db/schema/enums';
import { useWallFilterStore } from '../stores/wallFilterStore';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';
import { Button } from './ui/button';
import { Text } from './ui/text';

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
          <Button
            key={option.label}
            variant={active ? 'default' : 'outline'}
            accessibilityState={{ selected: active }}
            onPress={() => setConsoleType(option.value)}
            className="h-12 rounded-full px-5"
          >
            <Text className="text-base font-semibold">{option.label}</Text>
          </Button>
        );
      })}
    </ScrollView>
  );
}
