import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useThemeStore, type ThemePreference } from '../stores/themeStore';
import { cn } from '../utils/cn';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

// Selector del tema (ADR 0014): el del celular, claro u oscuro. La elección se guarda.
export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  return (
    <View accessibilityRole="radiogroup" className="flex-row gap-1 rounded-2xl bg-secondary p-1">
      {OPTIONS.map(({ value, label, icon }) => {
        const selected = preference === value;
        return (
          <Pressable
            key={value}
            testID={`tema-${value}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => setPreference(value)}
            className={cn(
              'h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl',
              selected ? 'border border-border bg-card' : 'active:bg-accent',
            )}
          >
            <Icon
              as={icon}
              size={18}
              className={selected ? 'text-foreground' : 'text-muted-foreground'}
            />
            <Text
              className={cn(
                'text-sm font-bold',
                selected ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

// Botón compacto para la cabecera: cada toque pasa al siguiente tema (sistema → claro → oscuro).
export function ThemeButton() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[0];
  return (
    <Pressable
      testID="boton-tema"
      accessibilityRole="button"
      accessibilityLabel={`Tema: ${current.label}. Toca para cambiar`}
      onPress={() => setPreference(NEXT[preference])}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-card active:bg-accent"
    >
      <Icon as={current.icon} size={20} />
    </Pressable>
  );
}
