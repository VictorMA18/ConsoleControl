import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { useThemeColors } from '../utils/theme';
import { Icon } from './ui/icon';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  testID?: string;
};

// Campo de búsqueda con lupa y botón para borrar. Lo usan el muro y Salud.
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  testID,
}: Props) {
  const { mutedForeground } = useThemeColors();
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-1">
      <Icon as={Search} size={18} className="text-muted-foreground" />
      <TextInput
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedForeground}
        autoCorrect={false}
        autoCapitalize="characters"
        returnKeyType="search"
        className="h-12 flex-1 font-sans text-base text-foreground"
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          onPress={() => onChangeText('')}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl active:bg-accent"
        >
          <Icon as={X} size={18} className="text-muted-foreground" />
        </Pressable>
      ) : null}
    </View>
  );
}
