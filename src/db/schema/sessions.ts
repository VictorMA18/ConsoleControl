import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { consoles } from './consoles';
import { controlColumns } from './controlColumns';
import { MAX_CONTROLLERS, MIN_CONTROLLERS, SESSION_MODES, SESSION_STATUSES } from './enums';
import { rates } from './rates';

// El tiempo transcurrido no se guarda: se calcula como ahora − started_at (ADR 0003).
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    consoleId: text('console_id')
      .notNull()
      .references(() => consoles.id),
    rateId: text('rate_id')
      .notNull()
      .references(() => rates.id),
    controllerCount: integer('controller_count').notNull(),
    mode: text('mode', { enum: SESSION_MODES }).notNull(),
    // Nulo en tiempo libre.
    durationMs: integer('duration_ms'),
    startedAt: integer('started_at').notNull(),
    // Nulo mientras la sesión está activa.
    endedAt: integer('ended_at'),
    status: text('status', { enum: SESSION_STATUSES }).notNull().default('activa'),
    // Estimado al abrir la sesión y definitivo al cerrarla.
    totalCents: integer('total_cents').notNull(),
    ...controlColumns,
  },
  (table) => [
    index('sessions_console_id_status_idx').on(table.consoleId, table.status),
    index('sessions_sync_status_idx').on(table.syncStatus),
    check(
      'sessions_controller_count_check',
      sql.raw(`controller_count BETWEEN ${MIN_CONTROLLERS} AND ${MAX_CONTROLLERS}`),
    ),
    // Tiempo libre sin duración; tiempo fijo con duración positiva.
    check(
      'sessions_duration_ms_check',
      sql`(mode = 'libre' AND duration_ms IS NULL) OR (mode <> 'libre' AND duration_ms > 0)`,
    ),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
