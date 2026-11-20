import type { SyncRecord, SyncTable } from './types';

// Destino del respaldo (HU-008). La implementación real es supabaseRemoteStore; las pruebas usan
// fakeRemoteStore. upsertRecords inserta o reemplaza por id, así que reenviar no duplica, y lanza
// un error si el envío no se confirmó (sin conexión, error del servidor...).
export interface RemoteStore {
  upsertRecords(table: SyncTable, records: readonly SyncRecord[]): Promise<void>;
}
