import type { ConsoleType } from '../db/schema/enums';

// Nombre visible de cada tipo de consola.
export const CONSOLE_TYPE_LABELS: Record<ConsoleType, string> = {
  ps3: 'PS3',
  ps4: 'PS4',
  ps5: 'PS5',
  xbox: 'Xbox',
  switch: 'Switch',
};
