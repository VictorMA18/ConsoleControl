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

// Cada estado tiene una etiqueta, un color (de la franja, el texto y el fondo suave) y un icono
// (en src/components/stateIcons.ts): nunca se depende solo del color (TW-90).
export const CARD_STATE_STYLES: Record<
  CardState,
  { label: string; band: string; tone: string; soft: string }
> = {
  disponible: {
    label: 'Disponible',
    band: 'bg-available',
    tone: 'text-available',
    soft: 'bg-available-soft',
  },
  en_juego: {
    label: 'En juego',
    band: 'bg-playing',
    tone: 'text-playing',
    soft: 'bg-playing-soft',
  },
  por_terminar: {
    label: 'Por terminar',
    band: 'bg-warning',
    tone: 'text-warning',
    soft: 'bg-warning-soft',
  },
  tiempo_cumplido: {
    label: 'Tiempo cumplido',
    band: 'bg-warning',
    tone: 'text-warning',
    soft: 'bg-warning-soft',
  },
  por_cobrar: {
    label: 'Por cobrar',
    band: 'bg-pending',
    tone: 'text-pending',
    soft: 'bg-pending-soft',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    band: 'bg-muted-foreground',
    tone: 'text-muted-foreground',
    soft: 'bg-secondary',
  },
};

// Orden en que se listan los estados en el resumen del muro.
export const CARD_STATE_ORDER: CardState[] = [
  'disponible',
  'en_juego',
  'por_terminar',
  'tiempo_cumplido',
  'por_cobrar',
  'mantenimiento',
];
