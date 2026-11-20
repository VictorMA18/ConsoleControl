import { Gamepad2 } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Marca de la app: un mando en un recuadro y el nombre en dos pesos de DM Sans.
export function Logo() {
  return (
    <View accessibilityRole="header" className="flex-row items-center gap-3">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary">
        <Icon as={Gamepad2} size={24} strokeWidth={2.25} className="text-primary-foreground" />
      </View>
      <View>
        <Text className="text-xl font-extrabold leading-6 tracking-tight">
          Console<Text className="text-xl font-medium text-muted-foreground">Control</Text>
        </Text>
        <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Panel del local
        </Text>
      </View>
    </View>
  );
}
