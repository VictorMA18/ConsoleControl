import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

// Márgenes del sistema (barra de estado y de gestos). Sin proveedor, como en las pruebas, son 0.
export function useInsets(): { top: number; bottom: number } {
  const insets = useContext(SafeAreaInsetsContext);
  return { top: insets?.top ?? 0, bottom: insets?.bottom ?? 0 };
}

export function useBottomInset(): number {
  return useInsets().bottom;
}
