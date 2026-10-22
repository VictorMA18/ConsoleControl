import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { controlColumns } from './controlColumns';
import { CONSOLE_STATUSES, CONSOLE_TYPES } from './enums';

export const consoles = sqliteTable('consoles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  consoleType: text('console_type', { enum: CONSOLE_TYPES }).notNull(),
  status: text('status', { enum: CONSOLE_STATUSES }).notNull().default('disponible'),
  ...controlColumns,
});

export type Console = typeof consoles.$inferSelect;
export type NewConsole = typeof consoles.$inferInsert;
