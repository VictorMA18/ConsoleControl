import { asc, eq } from 'drizzle-orm';

import { db } from '../client';
import { type ConsoleType, type Rate, type RateBlock, rates } from '../schema';

export async function getRates(): Promise<Rate[]> {
  return db.select().from(rates).all();
}

// Tarifario vigente de un tipo de consola, un precio por bloque de tiempo (HU-003).
export async function getRateBlocks(consoleType: ConsoleType): Promise<RateBlock[]> {
  return db
    .select({
      blockMinutes: rates.blockMinutes,
      priceCents: rates.priceCents,
      extraControllerCents: rates.extraControllerCents,
    })
    .from(rates)
    .where(eq(rates.consoleType, consoleType))
    .orderBy(asc(rates.blockMinutes))
    .all();
}
