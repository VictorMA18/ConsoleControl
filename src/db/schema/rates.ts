import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { controlColumns } from './controlColumns';
import { CONSOLE_TYPES, RATE_BLOCK_MINUTES } from './enums';

// Tarifario por tipo de consola y bloque de tiempo (T12, HU-003).
export const rates = sqliteTable(
  'rates',
  {
    id: text('id').primaryKey(),
    consoleType: text('console_type', { enum: CONSOLE_TYPES }).notNull(),
    // 15, 30, 45, 60 o 120 minutos.
    blockMinutes: integer('block_minutes').notNull(),
    // Precio del bloque con un mando.
    priceCents: integer('price_cents').notNull(),
    // Recargo del bloque por cada mando a partir del segundo (RN-01).
    extraControllerCents: integer('extra_controller_cents').notNull(),
    ...controlColumns,
  },
  (table) => [
    uniqueIndex('rates_console_type_block_minutes_idx').on(table.consoleType, table.blockMinutes),
    check(
      'rates_block_minutes_check',
      sql.raw(`block_minutes IN (${RATE_BLOCK_MINUTES.join(', ')})`),
    ),
    check('rates_cents_check', sql`price_cents >= 0 AND extra_controller_cents >= 0`),
  ],
);

export type Rate = typeof rates.$inferSelect;
export type NewRate = typeof rates.$inferInsert;

// Precios de un bloque, sin columnas de control. La sesión guarda una copia (RN-08).
export type RateBlock = Pick<Rate, 'blockMinutes' | 'priceCents' | 'extraControllerCents'>;
