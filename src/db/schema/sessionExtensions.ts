import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { controlColumns } from './controlColumns';
import { sessions } from './sessions';

// Bloques de 15 o 30 minutos que se añadieron a una sesión en curso (HU-009). La duración vigente
// está en sessions.duration_ms; esta tabla guarda el historial de cada extensión.
export const sessionExtensions = sqliteTable(
  'session_extensions',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id),
    minutes: integer('minutes').notNull(),
    // Monto estimado de la sesión antes y después de extender, en céntimos.
    previousTotalCents: integer('previous_total_cents').notNull(),
    newTotalCents: integer('new_total_cents').notNull(),
    ...controlColumns,
  },
  (table) => [
    index('session_extensions_session_id_idx').on(table.sessionId),
    index('session_extensions_sync_status_idx').on(table.syncStatus),
    check('session_extensions_minutes_check', sql`minutes IN (15, 30)`),
  ],
);

export type SessionExtension = typeof sessionExtensions.$inferSelect;
export type NewSessionExtension = typeof sessionExtensions.$inferInsert;
