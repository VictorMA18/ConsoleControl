import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { closeCurrentShift, getShiftOverview, listClosedShifts } from '../services/shiftService';

export const shiftQueryKey = ['shift'] as const;

// Turno abierto y sus cobros (HU-007). Los cobros nuevos invalidan shiftQueryKey.
export function useShiftOverview() {
  return useQuery({ queryKey: [...shiftQueryKey, 'current'], queryFn: getShiftOverview });
}

export function useClosedShifts() {
  return useQuery({ queryKey: [...shiftQueryKey, 'closed'], queryFn: listClosedShifts });
}

export function useCloseShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (countedCashCents: number) => closeCurrentShift(countedCashCents),
    onSuccess: async (result) => {
      if (result.ok) {
        await queryClient.invalidateQueries({ queryKey: shiftQueryKey });
      }
    },
  });
}
