import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import { consoles, type Maintenance, maintenances } from '../schema';
import type { MaintenanceKind } from '../schema/enums';

export async function getMaintenances(): Promise<Maintenance[]> {
  return db.select().from(maintenances).orderBy(desc(maintenances.performedAt)).all();
}

// Registra una intervención (HU-014) con las horas que tiene la consola en ese momento. Las horas
// acumuladas no cambian. Devuelve undefined si la consola no existe.
export async function recordMaintenance(
  consoleId: string,
  kind: MaintenanceKind,
  now: number = Date.now(),
): Promise<Maintenance | undefined> {
  return db.transaction((tx) => {
    const console = tx.select().from(consoles).where(eq(consoles.id, consoleId)).get();
    if (!console) {
      return undefined;
    }
    return tx
      .insert(maintenances)
      .values({
        id: randomUUID(),
        consoleId,
        kind,
        usageMinutesAt: console.usageMinutes,
        performedAt: now,
      })
      .returning()
      .get();
  });
}
