import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endSessionForPayment } from '../services/sessionService';
import { activeSessionsQueryKey } from './useActiveSessions';
import { consolesQueryKey } from './useConsoles';
import { pendingSessionsQueryKey } from './usePendingSessions';

// Finaliza una sesión y la deja por cobrar (HU-005). Al terminar bien, el muro y la pantalla de
// cobro vuelven a leer las sesiones.
export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endSessionForPayment(id),
    onSuccess: async (result) => {
      if (result.ok) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: consolesQueryKey }),
          queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey }),
          queryClient.invalidateQueries({ queryKey: pendingSessionsQueryKey }),
          queryClient.invalidateQueries({ queryKey: ['sessions', 'detail'] }),
        ]);
      }
    },
  });
}
