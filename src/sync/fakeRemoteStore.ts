import type { RemoteStore } from './remoteStore';
import type { SyncRecord, SyncTable } from './types';

export class RemoteUnavailableError extends Error {
  constructor() {
    super('Sin conexión con la nube');
    this.name = 'RemoteUnavailableError';
  }
}

// Nube simulada en memoria para las pruebas (HU-008). Guarda por id, como un upsert real, y puede
// simular que no hay conexión o que la conexión se corta después de aceptar N lotes.
export class FakeRemoteStore implements RemoteStore {
  readonly tables = new Map<SyncTable, Map<string, SyncRecord>>();
  // Número de llamadas por tabla, para comprobar el envío por lotes.
  readonly calls: { table: SyncTable; ids: string[] }[] = [];
  online = true;
  // Lotes que acepta antes de cortarse; null = sin límite.
  failAfterBatches: number | null = null;

  async upsertRecords(table: SyncTable, records: readonly SyncRecord[]): Promise<void> {
    if (!this.online || this.failAfterBatches === 0) {
      throw new RemoteUnavailableError();
    }
    if (this.failAfterBatches !== null) {
      this.failAfterBatches -= 1;
    }
    this.calls.push({ table, ids: records.map((r) => r.id) });
    const rows = this.tables.get(table) ?? new Map<string, SyncRecord>();
    for (const record of records) {
      rows.set(record.id, { ...record });
    }
    this.tables.set(table, rows);
  }

  count(table: SyncTable): number {
    return this.tables.get(table)?.size ?? 0;
  }
}
