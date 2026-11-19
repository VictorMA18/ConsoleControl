import type { ConsoleStatus } from '../db/schema/enums';
import type { SessionAlertState } from '../services/sessionAlerts';

// Estado visible de una tarjeta del muro (HU-002 escenario 3, T11). Cada estado tiene un color y
// una etiqueta, para no depender solo del color.
export type CardState =
  | 'disponible'
  | 'en_juego'
  | 'por_terminar'
  | 'tiempo_cumplido'
  | 'por_cobrar'
  | 'mantenimiento'
  | 'averiado';

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

// Cada estado tiene una etiqueta, sus colores y un icono (en src/components/stateIcons.ts): nunca
// se depende solo del color (TW-90). band es el fondo de la franja y onBand el texto sobre ella;
// tone es el texto del estado sobre la tarjeta y soft el fondo suave de avisos (global.css).
type StateStyle = { label: string; band: string; onBand: string; tone: string; soft: string };

export const CARD_STATE_STYLES: Record<CardState, StateStyle> = {
  disponible: {
    label: 'Disponible',
    band: 'bg-available',
    onBand: 'text-available-foreground',
    tone: 'text-available-tone',
    soft: 'bg-available-soft',
  },
  en_juego: {
    label: 'En juego',
    band: 'bg-playing',
    onBand: 'text-playing-foreground',
    tone: 'text-playing-tone',
    soft: 'bg-playing-soft',
  },
  por_terminar: {
    label: 'Por terminar',
    band: 'bg-warning',
    onBand: 'text-warning-foreground',
    tone: 'text-warning-tone',
    soft: 'bg-warning-soft',
  },
  tiempo_cumplido: {
    label: 'Tiempo cumplido',
    band: 'bg-warning',
    onBand: 'text-warning-foreground',
    tone: 'text-warning-tone',
    soft: 'bg-warning-soft',
  },
  por_cobrar: {
    label: 'Por cobrar',
    band: 'bg-pending',
    onBand: 'text-pending-foreground',
    tone: 'text-pending-tone',
    soft: 'bg-pending-soft',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    band: 'bg-maintenance',
    onBand: 'text-maintenance-foreground',
    tone: 'text-maintenance-tone',
    soft: 'bg-maintenance-soft',
  },
  // Falla reportada en el semáforo de salud (HU-012): fuera de servicio hasta repararla.
  averiado: {
    label: 'Averiada',
    band: 'bg-maintenance',
    onBand: 'text-maintenance-foreground',
    tone: 'text-destructive',
    soft: 'bg-playing-soft',
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
  'averiado',
];
