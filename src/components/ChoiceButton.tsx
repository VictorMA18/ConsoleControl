import { cn } from '../utils/cn';
import { Button } from './ui/button';
import { Text } from './ui/text';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

// Botón grande de una opción en el diálogo de sesión (mandos o modalidad), mínimo 56 dp de alto.
export function ChoiceButton({ label, selected, onPress, testID }: Props) {
  return (
    <Button
      testID={testID}
      role="radio"
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      variant={selected ? 'default' : 'outline'}
      onPress={onPress}
      className={cn(
        'h-auto min-h-14 flex-1 rounded-xl border-2 px-2',
        selected ? 'border-primary' : 'border-border',
      )}
    >
      <Text className="text-lg font-bold">{label}</Text>
    </Button>
  );
}
