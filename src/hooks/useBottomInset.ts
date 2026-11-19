import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

// Margen inferior del sistema (barra de gestos). Si no hay proveedor, como en las pruebas, es 0.
export function useBottomInset(): number {
  return useContext(SafeAreaInsetsContext)?.bottom ?? 0;
}
