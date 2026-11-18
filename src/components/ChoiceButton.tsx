import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

// Botón grande de una opción en el diálogo de sesión (mandos o modalidad), mínimo 56 dp de alto.
export function ChoiceButton({ label, selected, onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`min-h-14 flex-1 items-center justify-center rounded-xl border-2 px-2 ${
        selected ? 'border-primary bg-primary' : 'border-line bg-surface'
      }`}
    >
      <Text className={`text-lg font-bold ${selected ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
