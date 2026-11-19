import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { controlColumns } from './controlColumns';
import { PAYMENT_METHODS } from './enums';
import { sessions } from './sessions';

// Una fila por método usado al cobrar una sesión (HU-006): un pago mixto tiene varias filas cuya
// suma es el total de la liquidación. Los montos son céntimos enteros.
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id),
    method: text('method', { enum: PAYMENT_METHODS }).notNull(),
    amountCents: integer('amount_cents').notNull(),
    // Nombre o apodo del cliente; solo se usa en 'fiado' (HU-011 lo amplía).
    customerName: text('customer_name'),
    ...controlColumns,
  },
  (table) => [
    index('payments_session_id_idx').on(table.sessionId),
    index('payments_created_at_idx').on(table.createdAt),
    check('payments_amount_cents_check', sql`amount_cents > 0`),
  ],
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
