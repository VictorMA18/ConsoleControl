import type { ConsoleStatus } from '../db/schema/enums';
import type { SessionAlertState } from '../services/sessionAlerts';

// Estado visible de una tarjeta del muro (HU-002 escenario 3, T11). Cada estado tiene un color y
// una etiqueta, para no depender solo del color.
export type CardState =
  'disponible' | 'en_juego' | 'por_terminar' | 'tiempo_cumplido' | 'por_cobrar' | 'mantenimiento';

export function cardState(
  consoleStatus: ConsoleStatus,
  alertState: SessionAlertState | null,
): CardState {
  if (consoleStatus !== 'en_juego') {
    return consoleStatus;
  }
  // La sesión terminó y espera su pago (HU-005).
  if (alertState === 'finalizada') {
    return 'por_cobrar';
  }
  if (alertState === 'proxima_a_vencer') {
    return 'por_terminar';
  }
  if (alertState === 'tiempo_cumplido') {
    return 'tiempo_cumplido';
  }
  return 'en_juego';
}

// Verde disponible, rojo en juego y ámbar próxima a terminar o tiempo cumplido (TW-90).
export const CARD_STATE_STYLES: Record<CardState, { label: string; band: string; text: string }> = {
  disponible: { label: 'Disponible', band: 'bg-available', text: 'text-available-foreground' },
  en_juego: { label: 'En juego', band: 'bg-playing', text: 'text-playing-foreground' },
  por_terminar: { label: 'Por terminar', band: 'bg-warning', text: 'text-warning-foreground' },
  tiempo_cumplido: {
    label: 'Tiempo cumplido',
    band: 'bg-warning',
    text: 'text-warning-foreground',
  },
  por_cobrar: { label: 'Por cobrar', band: 'bg-primary', text: 'text-primary-foreground' },
  mantenimiento: {
    label: 'Mantenimiento',
    band: 'bg-muted-foreground',
    text: 'text-primary-foreground',
  },
};
