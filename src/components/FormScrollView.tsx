import type { ReactNode } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useInsets } from '../hooks/useBottomInset';
import { cn } from '../utils/cn';

type Props = {
  children: ReactNode;
  contentClassName?: string;
  // En pantallas sin barra de pestañas ni botón fijo abajo, el final del contenido debe quedar por
  // encima de la barra de navegación de Android: se suma su margen.
  insetBottom?: boolean;
};

// Contenido desplazable de las pantallas con formularios. Al enfocar un campo, la pantalla se
// desplaza para dejarlo visible por encima del teclado (react-native-keyboard-controller), con
// 24 dp de aire debajo.
export function FormScrollView({ children, contentClassName, insetBottom = false }: Props) {
  const { bottom } = useInsets();
  return (
    <KeyboardAwareScrollView
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      contentContainerClassName={cn('gap-4 p-4', contentClassName)}
      contentContainerStyle={{ paddingBottom: (insetBottom ? bottom : 0) + 24 }}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
