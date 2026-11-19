import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { MaintenanceKind } from '../db/schema/enums';
import { getMaintenanceStatus, type MaintenanceStatus } from '../services/maintenanceAlerts';
import { listMaintenances, registerMaintenance } from '../services/maintenanceService';
import { useEquipment } from './useEquipment';

export const maintenancesQueryKey = ['maintenances'] as const;

export function useMaintenances() {
  return useQuery({ queryKey: maintenancesQueryKey, queryFn: listMaintenances });
}

// Estado de mantenimiento de cada consola (HU-014), calculado con las horas de uso del semáforo y
// el historial de intervenciones. Sin datos todavía, devuelve una lista vacía.
export function useMaintenanceStatus(): MaintenanceStatus[] {
  const { data: equipment } = useEquipment();
  const { data: records } = useMaintenances();
  if (!equipment || !records) {
    return [];
  }
  return getMaintenanceStatus(equipment, records);
}

export function useRegisterMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ consoleId, kind }: { consoleId: string; kind: MaintenanceKind }) =>
      registerMaintenance(consoleId, kind),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: maintenancesQueryKey });
    },
  });
}
