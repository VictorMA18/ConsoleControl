import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ConsoleHealthStatus, ControllerHealthStatus } from '../services/health';
import {
  changeConsoleHealth,
  changeControllerHealth,
  listEquipment,
} from '../services/healthService';
import { consolesQueryKey } from './useConsoles';

export const equipmentQueryKey = ['equipment'] as const;

// Inventario con mandos, estados y horas de uso (HU-012).
export function useEquipment() {
  return useQuery({ queryKey: equipmentQueryKey, queryFn: listEquipment });
}

type Change =
  | { kind: 'console'; id: string; status: ConsoleHealthStatus }
  | { kind: 'controller'; id: string; status: ControllerHealthStatus };

// Cambia el estado de salud de una consola o un mando. Al terminar, el semáforo y el muro vuelven
// a leer el inventario (el muro muestra el stock de mandos y las consolas fuera de servicio).
export function useChangeHealth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (change: Change) =>
      change.kind === 'console'
        ? changeConsoleHealth(change.id, change.status)
        : changeControllerHealth(change.id, change.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: equipmentQueryKey }),
        queryClient.invalidateQueries({ queryKey: consolesQueryKey }),
      ]);
    },
  });
}
