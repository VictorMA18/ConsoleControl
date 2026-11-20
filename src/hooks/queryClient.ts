import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

// Cliente de TanStack Query de la app (ADR 0005). Los datos vienen de SQLite en el mismo
// celular, así que no hace falta reintentar como con una red.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// En React Native no hay "foco de ventana": se usa el estado de la app para volver a leer
// los datos al regresar del segundo plano.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});
