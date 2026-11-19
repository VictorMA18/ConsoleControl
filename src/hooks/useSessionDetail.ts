import { useQuery } from '@tanstack/react-query';

import { getSessionDetail } from '../services/sessionService';

export const sessionDetailQueryKey = (id: string) => ['sessions', 'detail', id] as const;

// Una sesión con el nombre y tipo de su consola, para la pantalla de cobro (HU-005).
export function useSessionDetail(id: string | undefined) {
  return useQuery({
    queryKey: sessionDetailQueryKey(id ?? ''),
    queryFn: () => getSessionDetail(id as string),
    enabled: Boolean(id),
  });
}
