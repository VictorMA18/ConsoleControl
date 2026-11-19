import { getPendingRecords, markRecordsSynced } from '../db/repositories/syncRepository';
import type { SyncSource } from './syncEngine';

// Origen real del respaldo: los pendientes de SQLite (HU-008).
export const sqliteSyncSource: SyncSource = {
  listPending: getPendingRecords,
  markSynced: markRecordsSynced,
};
