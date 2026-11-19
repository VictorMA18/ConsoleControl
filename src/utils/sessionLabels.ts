import type { SessionMode } from '../db/schema/enums';

// Nombre visible de cada modalidad de sesión.
export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  fijo_30: '30 min',
  fijo_60: '1 hora',
  fijo_120: '2 horas',
  libre: 'Tiempo libre',
};
