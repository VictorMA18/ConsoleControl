import { Pressable, Text, View } from 'react-native';

import type { ConsoleStatus } from '../db/schema/enums';
import type { ConsoleWithStock } from '../services/consoleService';
import { CONSOLE_TYPE_LABELS } from '../utils/consoleLabels';

const STATUS_STYLES: Record<ConsoleStatus, { label: string; band: string; text: string }> = {
  disponible: { label: 'Disponible', band: 'bg-available', text: 'text-white' },
  en_juego: { label: 'En juego', band: 'bg-playing', text: 'text-white' },
  mantenimiento: { label: 'Mantenimiento', band: 'bg-muted', text: 'text-white' },
};

type Props = {
  console: ConsoleWithStock;
  onPress: (console: ConsoleWithStock) => void;
};

// Tarjeta de una consola del muro (T07): nombre, tipo, estado y mandos disponibles.
// El estado se muestra con color y con texto, nunca solo con color.
export function ConsoleCard({ console, onPress }: Props) {
  const status = STATUS_STYLES[console.status];
  return (
    <Pressable
      testID={`console-card-${console.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${console.name}, ${status.label}`}
      onPress={() => onPress(console)}
      className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80"
    >
      <View className={`px-4 py-2 ${status.band}`}>
        <Text className={`text-base font-bold ${status.text}`}>{status.label}</Text>
      </View>
      <View className="gap-1 px-4 py-4">
        <Text className="text-2xl font-bold text-ink">{console.name}</Text>
        <Text className="text-base text-muted">
          {CONSOLE_TYPE_LABELS[console.consoleType]} · {console.operationalControllers} mandos
          libres
        </Text>
      </View>
    </Pressable>
  );
}
