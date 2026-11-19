import { useQuery } from '@tanstack/react-query';

import { listHourlyPrices } from '../services/sessionService';

// Precio por hora de cada tipo de consola, para las tarjetas libres del muro.
export function useHourlyPrices() {
  return useQuery({ queryKey: ['rates', 'hourly'], queryFn: listHourlyPrices });
}
