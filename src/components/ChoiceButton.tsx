import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { cn } from '../utils/cn';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
  icon?: LucideIcon;
  // Texto pequeño bajo la etiqueta.
  hint?: string;
  // 'radio' para elegir una opción; 'checkbox' cuando se pueden elegir varias.
  role?: 'radio' | 'checkbox';
};

// Opción grande y táctil (mandos, modalidad, método de pago): mínimo 56 dp de alto. La elegida se
// invierte (fondo claro, texto oscuro) para distinguirse sin depender de un color.
export function ChoiceButton({
  label,
  selected,
  onPress,
  testID,
  icon,
  hint,
  role = 'radio',
}: Props) {
  return (
    <Pressable
      testID={testID}
      role={role}
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={cn(
        'min-h-14 w-full justify-center gap-1 rounded-2xl border px-2 py-3 active:opacity-80',
        selected ? 'border-primary bg-primary' : 'border-border bg-raised',
      )}
    >
      {icon ? (
        <Icon
          as={icon}
          size={22}
          className={cn(
            'self-center',
            selected ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        />
      ) : null}
      <Text
        className={cn(
          'text-center text-lg font-bold',
          selected ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          className={cn(
            'text-center text-xs font-medium',
            selected ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}
