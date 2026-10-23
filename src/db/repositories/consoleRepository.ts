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

export type ConsoleWithStock = Console & { operationalControllers: number };

// Consolas disponibles con su stock de mandos, para sugerir alternativas (HU-001, escenario 2).
export async function getAvailableConsolesWithStock(): Promise<ConsoleWithStock[]> {
  const rows = db
    .select({ console: consoles, operationalControllers: count(controllers.id) })
    .from(consoles)
    .leftJoin(
      controllers,
      and(eq(controllers.consoleId, consoles.id), eq(controllers.status, 'operativo')),
    )
    .where(eq(consoles.status, 'disponible'))
    .groupBy(consoles.id)
    .orderBy(asc(consoles.name))
    .all();
  return rows.map((row) => ({
    ...row.console,
    operationalControllers: row.operationalControllers,
  }));
}
