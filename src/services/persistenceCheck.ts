import type { Session } from '../db/schema';
import { countOperationalControllers, getConsoles } from '../db/repositories/consoleRepository';
import { getRateBlocks, getRates } from '../db/repositories/rateRepository';
import {
  createSession,
  finishSession,
  getActiveSessions,
  getPendingSessionsWithConsole,
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
// Las sesiones de prueba quedan con 6 min restantes: la alerta de 5 min salta al minuto 1 y vence al 6.
const TEST_REMAINING_MS = 6 * 60 * 1000;

function testStartedAt(now: number): number {
  return now - (TEST_DURATION_MS - TEST_REMAINING_MS);
}

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
// Empieza como si hubiera arrancado hace 24 min (quedan 6) para ver las alertas de T15 sin esperar.
export async function createTestSession(
  now: number = Date.now(),
  durationMs: number = TEST_DURATION_MS,
): Promise<Session> {
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
      durationMs,
      totalCents: rate.priceCents,
    },
    testStartedAt(now),
  );
}

// Inicia con el servicio real una sesión de 30 min en la primera consola disponible, como si hubiera
// empezado hace 24 min: quedan 6 min, entra en "Por terminar" al minuto 1 y vence 5 min después. Sirve para
// probar en el celular las alertas de T15 y T16 sin esperar media hora (T18).
export async function startNearlyDueSession(now: number = Date.now()): Promise<StartSessionResult> {
  const target = (await getConsoles()).find((c) => c.status === 'disponible');
  if (!target) {
    throw new Error('No hay consolas disponibles');
  }
  return startSession(
    { consoleId: target.id, controllerCount: 1, mode: 'fijo_30' },
    testStartedAt(now),
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
  // También las que esperan su cobro: esta herramienta las libera sin registrar el pago.
  const active = [...(await getActiveSessions()), ...(await getPendingSessionsWithConsole())];
  for (const session of active) {
    await finishSession(session.id, now);
  }
  return active.length;
}
