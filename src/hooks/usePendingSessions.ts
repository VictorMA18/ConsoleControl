import { useQuery } from '@tanstack/react-query';

import { listPendingSessions } from '../services/sessionService';

export const pendingSessionsQueryKey = ['sessions', 'pending'] as const;

// Sesiones finalizadas que esperan su pago (HU-005). Al finalizar o cobrar hay que invalidarla.
export function usePendingSessions() {
  return useQuery({ queryKey: pendingSessionsQueryKey, queryFn: listPendingSessions });
}
