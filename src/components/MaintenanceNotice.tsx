import { ChevronRight, Wrench } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Aviso pequeño en el muro cuando alguna consola llegó a su umbral de mantenimiento (HU-014).
// Lleva a la pestaña Salud, donde se registra la intervención.
export function MaintenanceNotice({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      testID="aviso-mantenimiento"
      accessibilityRole="button"
      accessibilityLabel={`${count} mantenimientos pendientes. Ver en Salud`}
      onPress={onPress}
      className="mx-4 mt-3 flex-row items-center gap-2 rounded-2xl bg-warning-soft px-4 py-2.5 active:opacity-80"
    >
      <Icon as={Wrench} size={16} className="text-warning-tone" />
      <Text className="flex-1 text-sm font-bold text-warning-tone">
        {count === 1 ? '1 mantenimiento pendiente' : `${count} mantenimientos pendientes`}
      </Text>
      <Text className="text-sm font-semibold text-warning-tone">Ver</Text>
      <Icon as={ChevronRight} size={16} className="text-warning-tone" />
    </Pressable>
  );
}
