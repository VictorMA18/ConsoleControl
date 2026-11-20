// Valores permitidos en las columnas de texto con opciones fijas.
// Ver docs/architecture/base-de-datos.md.

export const CONSOLE_TYPES = ['ps3', 'ps4', 'ps5', 'xbox', 'switch'] as const;
export type ConsoleType = (typeof CONSOLE_TYPES)[number];

// 'mantenimiento' y 'averiado' sacan la consola de la asignación (HU-012, RN-06). 'averiado' hace
// de "defectuoso" en el semáforo (por confirmar con VN).
export const CONSOLE_STATUSES = ['disponible', 'en_juego', 'mantenimiento', 'averiado'] as const;
export type ConsoleStatus = (typeof CONSOLE_STATUSES)[number];

export const SESSION_MODES = ['fijo_30', 'fijo_60', 'fijo_120', 'libre'] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

// Bloques de tiempo con precio propio en el tarifario (T12). Pasada la hora se suman.
export const RATE_BLOCK_MINUTES = [15, 30, 45, 60, 120] as const;
export type RateBlockMinutes = (typeof RATE_BLOCK_MINUTES)[number];

// 'por_cobrar': la sesión terminó y espera el pago (HU-005); 'cobrada': pago registrado y consola
// liberada (HU-006). 'finalizada' es el cierre sin cobro de las herramientas de desarrollo.
export const SESSION_STATUSES = ['activa', 'por_cobrar', 'cobrada', 'finalizada'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

// 'en_uso' marca los mandos prestados en una sesión activa; vuelven a 'operativo' al cerrarla.
// 'mantenimiento' y 'averiado' los sacan del stock hasta volver a 'operativo' (HU-012).
export const CONTROLLER_STATUSES = ['operativo', 'en_uso', 'mantenimiento', 'averiado'] as const;
export type ControllerStatus = (typeof CONTROLLER_STATUSES)[number];

// Cómo se pagó (HU-006). 'fiado' solo se registra como método; su gestión es HU-011.
export const PAYMENT_METHODS = ['efectivo', 'yape', 'plin', 'fiado'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Turno de caja (HU-007): abierto hasta que el propietario cierra y concilia la caja (RN-05).
export const SHIFT_STATUSES = ['abierto', 'cerrado'] as const;
export type ShiftStatus = (typeof SHIFT_STATUSES)[number];

export const BALANCE_STATUSES = ['conforme', 'faltante', 'sobrante'] as const;
export type BalanceStatus = (typeof BALANCE_STATUSES)[number];

export const SYNC_STATUSES = ['pendiente', 'sincronizado'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const MIN_CONTROLLERS = 1;
export const MAX_CONTROLLERS = 6;

// Intervenciones de mantenimiento preventivo de una consola (HU-014).
export const MAINTENANCE_KINDS = ['limpieza', 'pasta_termica'] as const;
export type MaintenanceKind = (typeof MAINTENANCE_KINDS)[number];
