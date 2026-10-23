import type { Session } from '../db/schema';
import { countOperationalControllers, getConsoles } from '../db/repositories/consoleRepository';
import { getRate, getRates } from '../db/repositories/rateRepository';
import {
  createSession,
  getActiveSessions,
  updateSession,
} from '../db/repositories/sessionRepository';

// Apoyo para la prueba manual de persistencia de TW-28 (solo desarrollo).
// No contiene reglas de negocio: la apertura real de sesiones es T09.

export type PersistenceSnapshot = {
  consoles: number;
  operationalControllers: number;
  rates: number;
  activeSessions: Session[];
};

const TEST_DURATION_MS = 30 * 60 * 1000;

export async function getPersistenceSnapshot(): Promise<PersistenceSnapshot> {
  const consoles = await getConsoles();
  const controllerCounts = await Promise.all(
    consoles.map((console) => countOperationalControllers(console.id)),
  );
  return {
    consoles: consoles.length,
    operationalControllers: controllerCounts.reduce((sum, n) => sum + n, 0),
    rates: (await getRates()).length,
    activeSessions: await getActiveSessions(),
  };
}

export async function createTestSession(now: number = Date.now()): Promise<Session> {
  const [firstConsole] = await getConsoles();
  if (!firstConsole) {
    throw new Error('No hay consolas registradas');
  }
  const rate = await getRate(firstConsole.consoleType, 'fijo_30');
  if (!rate) {
    throw new Error(`No hay tarifa de 30 min para ${firstConsole.name}`);
  }
  return createSession(
    {
      consoleId: firstConsole.id,
      rateId: rate.id,
      controllerCount: 1,
      mode: 'fijo_30',
      durationMs: TEST_DURATION_MS,
      totalCents: rate.priceCents,
    },
    now,
  );
}

export async function finishActiveSessions(now: number = Date.now()): Promise<number> {
  const active = await getActiveSessions();
  for (const session of active) {
    await updateSession(session.id, { status: 'finalizada', endedAt: now });
  }
  return active.length;
}
