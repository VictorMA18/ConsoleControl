import { asc, and, eq, ne } from 'drizzle-orm';

import { db } from '../client';
import { type Console, type Controller, consoles, controllers } from '../schema';
import type { ConsoleStatus, ControllerStatus } from '../schema/enums';

export type EquipmentConsole = Console & { controllers: Controller[] };

// Inventario con sus mandos para el semáforo de salud (HU-012).
export async function getEquipment(): Promise<EquipmentConsole[]> {
  const allConsoles = db.select().from(consoles).orderBy(asc(consoles.name)).all();
  const allControllers = db.select().from(controllers).orderBy(asc(controllers.label)).all();
  return allConsoles.map((console) => ({
    ...console,
    controllers: allControllers.filter((c) => c.consoleId === console.id),
  }));
}

// Cambia el estado de salud de una consola. No toca una consola en juego: la sesión debe cerrarse
// antes. Devuelve undefined si no se pudo cambiar.
export async function setConsoleStatus(
  id: string,
  status: Exclude<ConsoleStatus, 'en_juego'>,
): Promise<Console | undefined> {
  return db
    .update(consoles)
    .set({ status })
    .where(and(eq(consoles.id, id), ne(consoles.status, 'en_juego')))
    .returning()
    .get();
}

// Igual para un mando: no se cambia mientras está prestado en una sesión.
export async function setControllerStatus(
  id: string,
  status: Exclude<ControllerStatus, 'en_uso'>,
): Promise<Controller | undefined> {
  return db
    .update(controllers)
    .set({ status })
    .where(and(eq(controllers.id, id), ne(controllers.status, 'en_uso')))
    .returning()
    .get();
}
