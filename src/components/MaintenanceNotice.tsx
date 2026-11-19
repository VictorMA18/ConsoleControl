import { ChevronRight, Wrench } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Aviso pequeño en el muro cuando alguna consola llegó a su umbral de mantenimiento (HU-014).
// Mismo formato que el aviso de alertas, en una línea. Lleva a la pestaña Salud.
export function MaintenanceNotice({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(220)} className="mx-4 mt-3">
      <Pressable
        testID="aviso-mantenimiento"
        accessibilityRole="button"
        accessibilityLabel={`${count} mantenimientos pendientes. Ver en Salud`}
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-2xl bg-secondary py-2 pl-2 pr-3 active:opacity-80"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-card">
          <Icon as={Wrench} size={16} className="text-warning-tone" />
        </View>
        <Text className="flex-1 text-sm font-bold">
          {count === 1 ? '1 mantenimiento pendiente' : `${count} mantenimientos pendientes`}
        </Text>
        <Text className="text-sm font-semibold text-muted-foreground">Salud</Text>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </Pressable>
    </Animated.View>
  );
}
