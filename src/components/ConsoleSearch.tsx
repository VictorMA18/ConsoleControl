import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { useWallFilterStore } from '../stores/wallFilterStore';
import { useThemeColors } from '../utils/theme';
import { Icon } from './ui/icon';

// Buscador del muro por identificador de máquina ("MAQ #3" o solo "3").
export function ConsoleSearch() {
  const query = useWallFilterStore((s) => s.query);
  const setQuery = useWallFilterStore((s) => s.setQuery);
  const { mutedForeground } = useThemeColors();
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-1">
      <Icon as={Search} size={18} className="text-muted-foreground" />
      <TextInput
        testID="buscar-maquina"
        accessibilityLabel="Buscar máquina"
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar máquina, por ejemplo 3"
        placeholderTextColor={mutedForeground}
        autoCorrect={false}
        autoCapitalize="characters"
        returnKeyType="search"
        className="h-12 flex-1 font-sans text-base text-foreground"
      />
      {query ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          onPress={() => setQuery('')}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-xl active:bg-accent"
        >
          <Icon as={X} size={18} className="text-muted-foreground" />
        </Pressable>
      ) : null}
    </View>
  );
}
