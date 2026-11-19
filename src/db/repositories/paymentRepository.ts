import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import {
  consoles,
  controllers,
  type PaymentMethod,
  payments,
  type Session,
  sessions,
} from '../schema';

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

    tx.insert(payments)
      .values(
        lines.map((line) => ({
          id: randomUUID(),
          sessionId,
          method: line.method,
          amountCents: line.amountCents,
          customerName: line.customerName ?? null,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .run();

    tx.update(consoles)
      .set({ status: 'disponible' })
      .where(and(eq(consoles.id, session.consoleId), eq(consoles.status, 'en_juego')))
      .run();
    tx.update(controllers)
      .set({ status: 'operativo' })
      .where(and(eq(controllers.consoleId, session.consoleId), eq(controllers.status, 'en_uso')))
      .run();
    // HU-012 acumulará aquí las horas de uso de la consola con los minutos jugados.

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
