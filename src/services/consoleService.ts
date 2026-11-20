import { type ConsoleWithStock, getConsolesWithStock } from '../db/repositories/consoleRepository';

export type { ConsoleWithStock };

// Inventario del muro de consolas leído desde SQLite (HU-001, T07).
export async function listConsoles(): Promise<ConsoleWithStock[]> {
  return getConsolesWithStock();
}
