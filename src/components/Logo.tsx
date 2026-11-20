import { View } from 'react-native';

import { BrandMark } from './BrandMark';
import { Text } from './ui/text';

// Marca de la app: el ícono y el nombre en dos pesos de Montserrat Alternates.
export function Logo() {
  return (
    <View accessibilityRole="header" className="flex-row items-center gap-3">
      <BrandMark size={44} />
      <View>
        <Text className="text-xl font-extrabold leading-6 tracking-tight">
          Console<Text className="text-xl font-medium text-muted-foreground">Control</Text>
        </Text>
        <Text className="text-xs font-semibold text-muted-foreground">Panel del local</Text>
      </View>
    </View>
  );
}
