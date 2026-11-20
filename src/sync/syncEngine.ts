import type { RemoteStore } from './remoteStore';
import { SYNC_TABLES, type SyncedRef, type SyncRecord, type SyncTable } from './types';

// Motor de sincronización (HU-008, ADR 0008): sube los registros pendientes de SQLite a la nube,
// en un solo sentido. No sabe de SQLite ni de Supabase: recibe por parámetro cómo leer pendientes,
// cómo marcarlos y a dónde enviarlos, así se prueba con la nube simulada.

export type SyncSource = {
  // Pendientes de una tabla en orden cronológico (updated_at y luego created_at).
  listPending(table: SyncTable): Promise<SyncRecord[]>;
  // Marca como sincronizados los registros confirmados, sin volverlos a 'pendiente'.
  markSynced(table: SyncTable, refs: readonly SyncedRef[]): Promise<void>;
};

export type SyncResult =
  | { ok: true; sent: number }
  // sent: los que sí se confirmaron antes del error; el resto sigue pendiente.
  | { ok: false; sent: number; table: SyncTable; error: string };

export const DEFAULT_BATCH_SIZE = 50;

// Envía todo lo pendiente, tabla por tabla y por lotes. Cada lote se marca sincronizado solo
// después de que la nube lo confirma. Ante un error se detiene y lo devuelve: nunca lanza, para
// que un problema de red no llegue a las pantallas (RN-09).
export async function runSync(
  source: SyncSource,
  remote: RemoteStore,
  options: { batchSize?: number; tables?: readonly SyncTable[] } = {},
): Promise<SyncResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  let sent = 0;
  for (const table of options.tables ?? SYNC_TABLES) {
    let pending: SyncRecord[];
    try {
      pending = await source.listPending(table);
    } catch (error) {
      return { ok: false, sent, table, error: describe(error) };
    }
    for (let start = 0; start < pending.length; start += batchSize) {
      const batch = pending.slice(start, start + batchSize);
      try {
        await remote.upsertRecords(table, batch);
        await source.markSynced(
          table,
          batch.map((record) => ({ id: record.id, updatedAt: record.updated_at })),
        );
      } catch (error) {
        return { ok: false, sent, table, error: describe(error) };
      }
      sent += batch.length;
    }
  }
  return { ok: true, sent };
}

// Espera antes de reintentar tras un fallo: 5 s, 15 s y luego 60 s como tope.
export const RETRY_DELAYS_MS = [5_000, 15_000, 60_000] as const;

export function retryDelayMs(failedAttempts: number): number {
  const index = Math.min(Math.max(failedAttempts, 1), RETRY_DELAYS_MS.length) - 1;
  return RETRY_DELAYS_MS[index] as number;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
