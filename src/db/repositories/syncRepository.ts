import { and, asc, eq, getTableColumns } from 'drizzle-orm';

import type { SyncedRef, SyncRecord, SyncTable } from '../../sync/types';
import { db } from '../client';
import {
  consoles,
  controllers,
  maintenances,
  payments,
  rates,
  sessionExtensions,
  sessions,
  shifts,
} from '../schema';

// Acceso a datos de la sincronización (HU-008). Es lo único que marca registros como
// 'sincronizado': lo hace asignando sync_status de forma explícita, así controlColumns no lo
// vuelve a 'pendiente'. Solo toca sync_status, así que vale también para turnos cerrados (RN-05).

const TABLES = {
  consoles,
  controllers,
  rates,
  shifts,
  sessions,
  session_extensions: sessionExtensions,
  payments,
  maintenances,
} as const;

// Todas las tablas comparten las columnas de control; para las consultas basta con esa forma.
type ControlledTable = typeof consoles;

function tableOf(name: SyncTable): ControlledTable {
  return TABLES[name] as unknown as ControlledTable;
}

// Pasa una fila de Drizzle (camelCase) a los nombres de columna de SQLite (snake_case), que son
// los mismos de la nube.
function toRecord(name: SyncTable, row: Record<string, unknown>): SyncRecord {
  const columns = getTableColumns(TABLES[name]) as Record<string, { name: string }>;
  const record: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(columns)) {
    record[column.name] = row[key] ?? null;
  }
  return record as SyncRecord;
}

// Pendientes de una tabla en orden cronológico.
export async function getPendingRecords(name: SyncTable): Promise<SyncRecord[]> {
  const table = tableOf(name);
  const rows = db
    .select()
    .from(table)
    .where(eq(table.syncStatus, 'pendiente'))
    .orderBy(asc(table.updatedAt), asc(table.createdAt))
    .all() as Record<string, unknown>[];
  return rows.map((row) => toRecord(name, row));
}

// Cuántos registros faltan por subir, para el indicador del muro.
export async function countPendingRecords(): Promise<number> {
  let total = 0;
  for (const name of Object.keys(TABLES) as SyncTable[]) {
    const table = tableOf(name);
    total += db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.syncStatus, 'pendiente'))
      .all().length;
  }
  return total;
}

// Marca como sincronizados los registros confirmados por la nube. Solo si updated_at sigue
// siendo el que se envió: si alguien lo cambió mientras tanto, queda pendiente para el próximo
// envío. updated_at se escribe con el mismo valor para que no cambie al marcar.
export async function markRecordsSynced(
  name: SyncTable,
  refs: readonly SyncedRef[],
): Promise<void> {
  const table = tableOf(name);
  db.transaction((tx) => {
    for (const ref of refs) {
      tx.update(table)
        .set({ syncStatus: 'sincronizado', updatedAt: ref.updatedAt })
        .where(and(eq(table.id, ref.id), eq(table.updatedAt, ref.updatedAt)))
        .run();
    }
  });
}
