import { useMutation, useQueryClient } from '@tanstack/react-query';

import { registerPayment } from '../services/paymentService';
import { activeSessionsQueryKey } from './useActiveSessions';
import { consolesQueryKey } from './useConsoles';
import { equipmentQueryKey } from './useEquipment';
import { pendingSessionsQueryKey } from './usePendingSessions';
import { shiftQueryKey } from './useShift';

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
          queryClient.invalidateQueries({ queryKey: shiftQueryKey }),
          // HU-012: el cobro suma las horas de uso de la consola y sus mandos.
          queryClient.invalidateQueries({ queryKey: equipmentQueryKey }),
        ]);
      }
    },
  });
}
