import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { controlColumns } from './controlColumns';
import { BALANCE_STATUSES, SHIFT_STATUSES } from './enums';

// Turno de caja (HU-007). Se abre solo con el primer cobro y se cierra con el arqueo: contado
// contra lo registrado. Al cerrarlo, sus registros quedan en solo lectura (RN-05).
export const shifts = sqliteTable(
  'shifts',
  {
    id: text('id').primaryKey(),
    openedAt: integer('opened_at').notNull(),
    // Nulo mientras el turno está abierto.
    closedAt: integer('closed_at'),
    status: text('status', { enum: SHIFT_STATUSES }).notNull().default('abierto'),
    // Totales del cierre, en céntimos: efectivo (lo esperado en caja), Yape y Plin juntos, y fiado.
    cashCents: integer('cash_cents'),
    digitalCents: integer('digital_cents'),
    creditCents: integer('credit_cents'),
    countedCashCents: integer('counted_cash_cents'),
    // Contado menos esperado: negativo es faltante.
    differenceCents: integer('difference_cents'),
    balance: text('balance', { enum: BALANCE_STATUSES }),
    ...controlColumns,
  },
  (table) => [index('shifts_status_idx').on(table.status)],
);

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
