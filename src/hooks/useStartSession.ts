import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type StartSessionInput } from '../schemas/session';
import { startSession } from '../services/sessionService';
import { activeSessionsQueryKey } from './useActiveSessions';
import { consolesQueryKey } from './useConsoles';

// Inicia una sesión (HU-001, T08). Al terminar bien, el muro vuelve a leer las consolas y las
// sesiones activas, porque la consola pasa a "En juego" y sus mandos dejan de estar libres.
export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StartSessionInput) => startSession(input),
    onSuccess: async (result) => {
      if (result.ok) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: consolesQueryKey }),
          queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey }),
        ]);
      }
    },
  });
}
