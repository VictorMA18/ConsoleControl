import { useQuery } from '@tanstack/react-query';

import { listConsoles } from '../services/consoleService';

export const consolesQueryKey = ['consoles'] as const;

// Consolas del muro con su estado y stock. Hay que invalidar consolesQueryKey después de
// abrir o cerrar una sesión, porque cambian el estado de la consola y sus mandos.
export function useConsoles() {
  return useQuery({ queryKey: consolesQueryKey, queryFn: listConsoles });
}
