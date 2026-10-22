import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { CONSOLE_TYPES, SESSION_MODES } from './enums';

export const rates = sqliteTable(
  'rates',
  {
    id: text('id').primaryKey(),
    consoleType: text('console_type', { enum: CONSOLE_TYPES }).notNull(),
    mode: text('mode', { enum: SESSION_MODES }).notNull(),
    // Precio con un mando. En tiempo libre, precio por hora.
    priceCents: integer('price_cents').notNull(),
    // Recargo por cada mando a partir del segundo (RN-01).
    extraControllerCents: integer('extra_controller_cents').notNull(),
  },
  (table) => [uniqueIndex('rates_console_type_mode_idx').on(table.consoleType, table.mode)],
);

export type Rate = typeof rates.$inferSelect;
export type NewRate = typeof rates.$inferInsert;
