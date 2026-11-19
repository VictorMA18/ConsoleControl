import { useQuery } from '@tanstack/react-query';

import type { ConsoleType } from '../db/schema/enums';
import { listRateBlocks } from '../services/sessionService';

// Tarifario de un tipo de consola, leído una vez y reutilizado mientras el diálogo está abierto.
export function useRateBlocks(consoleType: ConsoleType | undefined) {
  return useQuery({
    queryKey: ['rates', consoleType],
    queryFn: () => listRateBlocks(consoleType as ConsoleType),
    enabled: consoleType !== undefined,
  });
}
