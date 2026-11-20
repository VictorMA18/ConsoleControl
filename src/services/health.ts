import type { ConsoleStatus, ControllerStatus } from '../db/schema/enums';

// Semáforo de salud de consolas y mandos (HU-012). Funciones puras, sin base de datos.

export type HealthLight = 'verde' | 'ambar' | 'rojo';

// Estados que el propietario puede asignar desde el semáforo. 'en_juego' y 'en_uso' los pone la
// sesión, no la persona.
export const CONSOLE_HEALTH_STATUSES = ['disponible', 'mantenimiento', 'averiado'] as const;
export type ConsoleHealthStatus = (typeof CONSOLE_HEALTH_STATUSES)[number];
export const CONTROLLER_HEALTH_STATUSES = ['operativo', 'mantenimiento', 'averiado'] as const;
export type ControllerHealthStatus = (typeof CONTROLLER_HEALTH_STATUSES)[number];

// Verde operativo (también mientras se usa), ámbar en mantenimiento y rojo averiado.
export function consoleLight(status: ConsoleStatus): HealthLight {
  return status === 'averiado' ? 'rojo' : status === 'mantenimiento' ? 'ambar' : 'verde';
}

export function controllerLight(status: ControllerStatus): HealthLight {
  return status === 'averiado' ? 'rojo' : status === 'mantenimiento' ? 'ambar' : 'verde';
}

// RN-06: solo se asignan a una sesión la consola disponible y los mandos operativos. Una consola
// en juego tampoco se asigna porque ya está ocupada.
export function isConsoleAssignable(status: ConsoleStatus): boolean {
  return status === 'disponible';
}

export function isControllerAssignable(status: ControllerStatus): boolean {
  return status === 'operativo';
}

// Una consola en juego o un mando en uso no se cambian desde el semáforo: primero hay que cerrar
// la sesión, para no dejarla a medias.
export function canChangeConsoleHealth(status: ConsoleStatus): boolean {
  return status !== 'en_juego';
}

export function canChangeControllerHealth(status: ControllerStatus): boolean {
  return status !== 'en_uso';
}

// La suma de horas vive en la capa de datos porque la usa la transacción de cobro.
export { addUsageMinutes } from '../db/usage';

// 754 → "12 h 34 min"; 45 → "45 min".
export function formatUsage(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
