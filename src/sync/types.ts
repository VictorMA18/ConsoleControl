// Tipos comunes de la sincronización con la nube (HU-008, ADR 0008). Sin dependencias de la base
// ni de Supabase, para que el motor se pueda probar con un servidor simulado.

// Tablas que se respaldan, en el orden en que se envían: primero las que otras referencian (una
// sesión apunta a su consola; un pago, a su sesión y su turno).
export const SYNC_TABLES = [
  'consoles',
  'controllers',
  'rates',
  'shifts',
  'sessions',
  'session_extensions',
  'payments',
  'maintenances',
] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

// Un registro listo para enviar: columnas con su nombre de SQLite (snake_case), igual que en la
// nube. id y updated_at siempre están.
export type SyncRecord = { id: string; updated_at: number } & Record<string, unknown>;

// Lo que se confirma como sincronizado: el id y el updated_at que se enviaron. Si el registro
// cambió mientras tanto, sigue pendiente y se envía otra vez.
export type SyncedRef = { id: string; updatedAt: number };
