import { useQuery } from '@tanstack/react-query';

import { listActiveSessions } from '../services/sessionService';

export const activeSessionsQueryKey = ['sessions', 'active'] as const;

// Sesiones activas restauradas desde SQLite al abrir la app y al volver a ella (TW-86).
// Después de abrir o cerrar una sesión hay que invalidar activeSessionsQueryKey.
export function useActiveSessions() {
  return useQuery({
    queryKey: activeSessionsQueryKey,
    queryFn: listActiveSessions,
  });
}
