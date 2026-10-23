import { integer, text } from 'drizzle-orm/sqlite-core';

import { SYNC_STATUSES } from './enums';

// Columnas de control que llevan todas las tablas para el respaldo con Supabase (ADR 0008).
// Toda escritura deja el registro en 'pendiente'; solo src/sync/ lo marca 'sincronizado'
// asignando sync_status de forma explícita.
export const controlColumns = {
  createdAt: integer('created_at')
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at')
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
  syncStatus: text('sync_status', { enum: SYNC_STATUSES })
    .notNull()
    .default('pendiente')
    .$onUpdateFn(() => 'pendiente'),
};
