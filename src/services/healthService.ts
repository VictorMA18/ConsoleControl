import {
  type EquipmentConsole,
  getEquipment,
  setConsoleStatus,
  setControllerStatus,
} from '../db/repositories/healthRepository';
import type { ConsoleHealthStatus, ControllerHealthStatus } from './health';

export type { EquipmentConsole };

export type HealthChangeResult = { ok: true } | { ok: false; message: string };

// Consolas con sus mandos, estados y horas de uso para el semáforo (HU-012).
export async function listEquipment(): Promise<EquipmentConsole[]> {
  return getEquipment();
}

// Reportar falla, poner en mantenimiento o volver a operativo una consola. Una consola en juego
// no cambia: hay que cerrar su sesión primero.
export async function changeConsoleHealth(
  id: string,
  status: ConsoleHealthStatus,
): Promise<HealthChangeResult> {
  const updated = await setConsoleStatus(id, status);
  return updated
    ? { ok: true }
    : { ok: false, message: 'La consola está en juego: finaliza y cobra su sesión primero' };
}

export async function changeControllerHealth(
  id: string,
  status: ControllerHealthStatus,
): Promise<HealthChangeResult> {
  const updated = await setControllerStatus(id, status);
  return updated
    ? { ok: true }
    : { ok: false, message: 'El mando está prestado en una sesión: espera a que termine' };
}
