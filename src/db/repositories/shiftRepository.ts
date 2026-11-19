import { and, desc, eq, isNotNull, or } from 'drizzle-orm';

import { db } from '../client';
import { type NewShift, payments, type Payment, type Shift, shifts } from '../schema';

export async function getOpenShift(): Promise<Shift | undefined> {
  return db.select().from(shifts).where(eq(shifts.status, 'abierto')).get();
}

export async function getShiftPayments(shiftId: string): Promise<Payment[]> {
  return db.select().from(payments).where(eq(payments.shiftId, shiftId)).all();
}

// Cobros del turno que la auditoría debe revisar: modificados o de saldo pendiente (fiado).
export async function getAuditPayments(shiftId: string): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.shiftId, shiftId),
        or(isNotNull(payments.modifiedAt), eq(payments.method, 'fiado')),
      ),
    )
    .all();
}

export type ShiftClosing = Required<
  Pick<
    NewShift,
    | 'cashCents'
    | 'digitalCents'
    | 'creditCents'
    | 'countedCashCents'
    | 'differenceCents'
    | 'balance'
  >
>;

// Cierra el turno abierto con el resultado del arqueo (HU-007). Lo cierra solo si sigue abierto.
export async function closeShift(
  shiftId: string,
  closing: ShiftClosing,
  now: number = Date.now(),
): Promise<Shift | undefined> {
  return db
    .update(shifts)
    .set({ ...closing, status: 'cerrado', closedAt: now })
    .where(and(eq(shifts.id, shiftId), eq(shifts.status, 'abierto')))
    .returning()
    .get();
}

// Turnos cerrados, del más reciente al más antiguo.
export async function getClosedShifts(limit = 30): Promise<Shift[]> {
  return db
    .select()
    .from(shifts)
    .where(eq(shifts.status, 'cerrado'))
    .orderBy(desc(shifts.closedAt))
    .limit(limit)
    .all();
}
