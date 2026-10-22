// Valores permitidos en las columnas de texto con opciones fijas.
// Ver docs/architecture/base-de-datos.md.

export const CONSOLE_TYPES = ['ps4', 'ps5', 'xbox', 'switch'] as const;
export type ConsoleType = (typeof CONSOLE_TYPES)[number];

export const CONSOLE_STATUSES = ['disponible', 'en_juego', 'mantenimiento'] as const;
export type ConsoleStatus = (typeof CONSOLE_STATUSES)[number];

export const SESSION_MODES = ['fijo_30', 'fijo_60', 'fijo_120', 'libre'] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

export const SESSION_STATUSES = ['activa', 'finalizada'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const MIN_CONTROLLERS = 1;
export const MAX_CONTROLLERS = 6;
