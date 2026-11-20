import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { consoles } from './consoles';
import { controlColumns } from './controlColumns';
import { MAINTENANCE_KINDS } from './enums';

// Intervenciones de mantenimiento preventivo (HU-014). Las horas de uso de la consola nunca se
// ponen a cero: se guardan las que tenía al intervenirla y las horas desde la última intervención
// son la diferencia.
export const maintenances = sqliteTable(
  'maintenances',
  {
    id: text('id').primaryKey(),
    consoleId: text('console_id')
      .notNull()
      .references(() => consoles.id),
    kind: text('kind', { enum: MAINTENANCE_KINDS }).notNull(),
    // consoles.usage_minutes en el momento de la intervención.
    usageMinutesAt: integer('usage_minutes_at').notNull(),
    performedAt: integer('performed_at').notNull(),
    ...controlColumns,
  },
  (table) => [
    index('maintenances_console_id_kind_idx').on(table.consoleId, table.kind),
    index('maintenances_sync_status_idx').on(table.syncStatus),
  ],
);

export type Maintenance = typeof maintenances.$inferSelect;
export type NewMaintenance = typeof maintenances.$inferInsert;
