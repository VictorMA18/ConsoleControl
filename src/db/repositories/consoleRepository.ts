import { and, asc, count, eq } from 'drizzle-orm';

import { db } from '../client';
import { type Console, consoles, controllers } from '../schema';

export async function getConsoles(): Promise<Console[]> {
  return db.select().from(consoles).orderBy(asc(consoles.name)).all();
}

export async function getConsoleById(id: string): Promise<Console | undefined> {
  return db.select().from(consoles).where(eq(consoles.id, id)).get();
}

// Mandos que se pueden prestar en una sesión (HU-001, escenario 2).
export async function countOperationalControllers(consoleId: string): Promise<number> {
  const row = db
    .select({ total: count() })
    .from(controllers)
    .where(and(eq(controllers.consoleId, consoleId), eq(controllers.status, 'operativo')))
    .get();
  return row?.total ?? 0;
}
