import type { Session } from '../db/schema';
import { countOperationalControllers, getConsoles } from '../db/repositories/consoleRepository';
import { getRateBlocks, getRates } from '../db/repositories/rateRepository';
import {
  createSession,
  finishSession,
  getActiveSessions,
} from '../db/repositories/sessionRepository';
import { startSession, type StartSessionResult } from './sessionService';

// Apoyo para las pruebas manuales en el celular (solo desarrollo): persistencia de TW-28 y
// escenarios de inicio de sesión de T09.

export type PersistenceSnapshot = {
  consoles: number;
  consolesInPlay: number;
  operationalControllers: number;
  rates: number;
  activeSessions: Session[];
};

export type SessionScenario = 'exito' | 'mandos_insuficientes' | 'consola_ocupada';

const TEST_DURATION_MS = 30 * 60 * 1000;

export async function getPersistenceSnapshot(): Promise<PersistenceSnapshot> {
  const consoles = await getConsoles();
  const controllerCounts = await Promise.all(
    consoles.map((console) => countOperationalControllers(console.id)),
  );
  return {
    consoles: consoles.length,
    consolesInPlay: consoles.filter((c) => c.status === 'en_juego').length,
    operationalControllers: controllerCounts.reduce((sum, n) => sum + n, 0),
    rates: (await getRates()).length,
    activeSessions: await getActiveSessions(),
  };
}

// Crea una sesión directamente en el repositorio, sin ocupar la consola (prueba de TW-28).
export async function createTestSession(now: number = Date.now()): Promise<Session> {
  const [firstConsole] = await getConsoles();
  if (!firstConsole) {
    throw new Error('No hay consolas registradas');
  }
  const rates = await getRateBlocks(firstConsole.consoleType);
  const rate = rates.find((r) => r.blockMinutes === 30);
  if (!rate) {
    throw new Error(`No hay tarifa de 30 min para ${firstConsole.name}`);
  }
  return createSession(
    {
      consoleId: firstConsole.id,
      rateSnapshot: rates,
      controllerCount: 1,
      mode: 'fijo_30',
      durationMs: TEST_DURATION_MS,
      totalCents: rate.priceCents,
    },
    now,
  );
}

// Ejecuta un escenario de HU-001 con el servicio real de T09.
export async function trySessionScenario(scenario: SessionScenario): Promise<StartSessionResult> {
  const consoles = await getConsoles();
  const target =
    scenario === 'consola_ocupada'
      ? consoles.find((c) => c.status === 'en_juego')
      : consoles.find((c) => c.status === 'disponible');
  if (!target) {
    throw new Error(
      scenario === 'consola_ocupada'
        ? 'Ninguna consola está en juego. Usa primero el botón 1: las sesiones de ' +
            '«Crear sesión de prueba» no ocupan la consola'
        : 'No hay consolas disponibles',
    );
  }
  return startSession({
    consoleId: target.id,
    controllerCount: scenario === 'mandos_insuficientes' ? 6 : 2,
    mode: 'fijo_30',
  });
}

export async function finishActiveSessions(now: number = Date.now()): Promise<number> {
  const active = await getActiveSessions();
  for (const session of active) {
    await finishSession(session.id, now);
  }
  return active.length;
}
