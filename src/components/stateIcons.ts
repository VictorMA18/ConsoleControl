import {
  BellRing,
  CircleCheck,
  CircleX,
  Play,
  Receipt,
  TimerOff,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import type { CardState } from '../utils/cardState';

// Icono de cada estado de la consola: junto con la etiqueta, el color no es lo único que informa.
export const STATE_ICONS: Record<CardState, LucideIcon> = {
  disponible: CircleCheck,
  en_juego: Play,
  por_terminar: BellRing,
  tiempo_cumplido: TimerOff,
  por_cobrar: Receipt,
  mantenimiento: Wrench,
  averiado: CircleX,
};
