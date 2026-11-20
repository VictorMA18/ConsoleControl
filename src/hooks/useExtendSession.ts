import { useMutation, useQueryClient } from '@tanstack/react-query';

import { extendSession } from '../services/sessionService';
import { activeSessionsQueryKey } from './useActiveSessions';
import { consolesQueryKey } from './useConsoles';
import { pendingSessionsQueryKey } from './usePendingSessions';

// Añade 15 o 30 minutos a una sesión en curso (HU-009). Al terminar bien, el muro y la pantalla
// de la sesión vuelven a leerla con el vencimiento y el monto nuevos.
export function useExtendSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => extendSession(id, minutes),
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
