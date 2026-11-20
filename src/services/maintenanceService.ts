import { getMaintenances, recordMaintenance } from '../db/repositories/maintenanceRepository';
import type { Maintenance } from '../db/schema';
import type { MaintenanceKind } from '../db/schema/enums';

export async function listMaintenances(): Promise<Maintenance[]> {
  return getMaintenances();
}

export type RecordMaintenanceResult = { ok: true } | { ok: false; message: string };

// "Registrar mantenimiento" (HU-014): guarda la intervención y con eso la alerta desaparece.
export async function registerMaintenance(
  consoleId: string,
  kind: MaintenanceKind,
): Promise<RecordMaintenanceResult> {
  const saved = await recordMaintenance(consoleId, kind);
  return saved ? { ok: true } : { ok: false, message: 'La consola no existe' };
}
