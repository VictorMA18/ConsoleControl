import { and, eq } from 'drizzle-orm';

import { db } from '../client';
import { type ConsoleType, type Rate, rates, type SessionMode } from '../schema';

export async function getRates(): Promise<Rate[]> {
  return db.select().from(rates).all();
}

// Tarifa vigente para abrir una sesión (HU-003).
export async function getRate(
  consoleType: ConsoleType,
  mode: SessionMode,
): Promise<Rate | undefined> {
  return db
    .select()
    .from(rates)
    .where(and(eq(rates.consoleType, consoleType), eq(rates.mode, mode)))
    .get();
}
