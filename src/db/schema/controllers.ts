import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { consoles } from './consoles';
import { controlColumns } from './controlColumns';
import { CONTROLLER_STATUSES } from './enums';

// Mandos físicos de cada consola. Solo los operativos cuentan como stock (HU-001).
export const controllers = sqliteTable(
  'controllers',
  {
    id: text('id').primaryKey(),
    consoleId: text('console_id')
      .notNull()
      .references(() => consoles.id),
    label: text('label').notNull(),
    status: text('status', { enum: CONTROLLER_STATUSES }).notNull().default('operativo'),
    ...controlColumns,
  },
  (table) => [index('controllers_console_id_idx').on(table.consoleId)],
);

export type Controller = typeof controllers.$inferSelect;
export type NewController = typeof controllers.$inferInsert;
