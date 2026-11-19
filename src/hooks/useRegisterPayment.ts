import { useMutation, useQueryClient } from '@tanstack/react-query';

import { registerPayment } from '../services/paymentService';
import { activeSessionsQueryKey } from './useActiveSessions';
import { consolesQueryKey } from './useConsoles';
import { pendingSessionsQueryKey } from './usePendingSessions';

// Cobra una sesión (HU-006). Al terminar bien, la consola vuelve a estar disponible en el muro.
export function useRegisterPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerPayment,
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
