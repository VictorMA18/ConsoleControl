import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import {
  consoles,
  controllers,
  type PaymentMethod,
  payments,
  type Session,
  sessions,
  shifts,
} from '../schema';
import { addUsageMinutes } from '../usage';

export class SessionNotPayableError extends Error {
  constructor() {
    super('La sesión no está por cobrar');
    this.name = 'SessionNotPayableError';
  }
}

export type PaymentLine = {
  method: PaymentMethod;
  amountCents: number;
  customerName?: string | undefined;
};

// Registra el pago de una sesión por cobrar (HU-006) en una sola transacción: guarda los pagos,
// pasa la sesión a 'cobrada', libera la consola y devuelve los mandos al inventario. Si algo
// falla no queda nada a medias (por ejemplo, si se cierra la app a mitad del cobro).
export async function registerPayments(
  sessionId: string,
  lines: PaymentLine[],
  now: number = Date.now(),
): Promise<Session> {
  return db.transaction((tx) => {
    const session = tx
      .update(sessions)
      .set({ status: 'cobrada' })
      .where(and(eq(sessions.id, sessionId), eq(sessions.status, 'por_cobrar')))
      .returning()
      .get();
    if (!session) {
      throw new SessionNotPayableError();
    }

    // Si no hay turno abierto, el primer cobro abre uno (por confirmar con VN).
    const shift =
      tx.select().from(shifts).where(eq(shifts.status, 'abierto')).get() ??
      tx
        .insert(shifts)
        .values({
          id: randomUUID(),
          openedAt: now,
          status: 'abierto',
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

    tx.insert(payments)
      .values(
        lines.map((line) => ({
          id: randomUUID(),
          sessionId,
          method: line.method,
          amountCents: line.amountCents,
          customerName: line.customerName ?? null,
          shiftId: shift.id,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .run();

    // HU-012: la consola y los mandos prestados suman los minutos jugados de la liquidación.
    const played = session.playedMinutes ?? 0;
    const console = tx.select().from(consoles).where(eq(consoles.id, session.consoleId)).get();
    if (console) {
      tx.update(consoles)
        .set({ usageMinutes: addUsageMinutes(console.usageMinutes, played) })
        .where(eq(consoles.id, console.id))
        .run();
    }
    const lent = tx
      .select()
      .from(controllers)
      .where(and(eq(controllers.consoleId, session.consoleId), eq(controllers.status, 'en_uso')))
      .all();
    for (const controller of lent) {
      tx.update(controllers)
        .set({ usageMinutes: addUsageMinutes(controller.usageMinutes, played) })
        .where(eq(controllers.id, controller.id))
        .run();
    }

    tx.update(consoles)
      .set({ status: 'disponible' })
      .where(and(eq(consoles.id, session.consoleId), eq(consoles.status, 'en_juego')))
      .run();
    tx.update(controllers)
      .set({ status: 'operativo' })
      .where(and(eq(controllers.consoleId, session.consoleId), eq(controllers.status, 'en_uso')))
      .run();

    return session;
  });
}

export type MethodTotal = { method: PaymentMethod; totalCents: number };

// Cobros entre dos horas (desde incluida, hasta excluida) sumados por método: la caja del día
// (HU-007 los usa).
export async function getPaymentTotalsByMethod(from: number, to: number): Promise<MethodTotal[]> {
  return db
    .select({ method: payments.method, totalCents: sql<number>`sum(${payments.amountCents})` })
    .from(payments)
    .where(and(gte(payments.createdAt, from), lt(payments.createdAt, to)))
    .groupBy(payments.method)
    .all();
}

// Marca cobros como sincronizados (HU-008). Es lo único que se permite en un turno cerrado (RN-05):
// asigna sync_status de forma explícita, así no vuelve a 'pendiente' (controlColumns.ts).
export async function markPaymentsSynced(ids: string[]): Promise<void> {
  db.update(payments).set({ syncStatus: 'sincronizado' }).where(inArray(payments.id, ids)).run();
}
