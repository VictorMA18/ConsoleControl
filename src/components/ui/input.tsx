// Componente de React Native Reusables (MIT), adaptado al sistema de diseño (ADR 0014).
import { TextInput } from 'react-native';

import { cn } from '../../utils/cn';
import { useThemeColors } from '../../utils/theme';

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  const { mutedForeground } = useThemeColors();
  return (
    <TextInput
      className={cn(
        'h-14 w-full rounded-2xl border border-input bg-card px-4 font-sans text-xl text-foreground',
        props.editable === false && 'opacity-50',
        className,
      )}
      placeholderTextColor={mutedForeground}
      {...props}
    />
  );
}

export { Input };
