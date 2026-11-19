import {
  type ConsoleWithStock,
  countOperationalControllers,
  getAvailableConsolesWithStock,
  getConsoleById,
} from '../db/repositories/consoleRepository';
import { getRateBlocks } from '../db/repositories/rateRepository';
import {
  type ActiveSession,
  ConsoleNotAvailableError,
  getActiveSessionsWithConsole,
  InsufficientControllersError,
  openSession,
} from '../db/repositories/sessionRepository';
import type { ConsoleStatus, ConsoleType } from '../db/schema/enums';
import type { RateBlock, Session } from '../db/schema';
import { startSessionSchema } from '../schemas/session';
import { estimateTotalCents, MODE_DURATION_MS } from './sessionQuote';

export { estimateTotalCents, MODE_DURATION_MS };

export type StartSessionResult =
  | { ok: true; session: Session }
  | { ok: false; reason: 'datos_invalidos'; message: string }
  | { ok: false; reason: 'consola_no_encontrada'; message: string }
  | { ok: false; reason: 'consola_no_disponible'; status: ConsoleStatus; message: string }
  | {
      ok: false;
      reason: 'mandos_insuficientes';
      available: number;
      alternatives: ConsoleWithStock[];
      message: string;
    };

const STATUS_LABELS: Record<ConsoleStatus, string> = {
  disponible: 'disponible',
  en_juego: 'en juego',
  mantenimiento: 'en mantenimiento',
};

// Alternativas con mandos operativos suficientes; primero las del mismo tipo (HU-001, escenario 2).
async function findAlternatives(
  consoleId: string,
  consoleType: string,
  controllerCount: number,
): Promise<ConsoleWithStock[]> {
  const available = await getAvailableConsolesWithStock();
  return available
    .filter((c) => c.id !== consoleId && c.operationalControllers >= controllerCount)
    .sort((a, b) => Number(b.consoleType === consoleType) - Number(a.consoleType === consoleType));
}

// Inicia una sesión de juego (HU-001). Valida los datos, el estado de la consola y los mandos,
// y guarda todo en una sola transacción.
export async function startSession(
  rawInput: unknown,
  now: number = Date.now(),
): Promise<StartSessionResult> {
  const parsed = startSessionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'datos_invalidos',
      message: 'Los datos de la sesión no son válidos',
    };
  }
  const { consoleId, controllerCount, mode } = parsed.data;

  const console = await getConsoleById(consoleId);
  if (!console) {
    return { ok: false, reason: 'consola_no_encontrada', message: 'La consola no existe' };
  }

  // Escenario 3: consola ocupada o en mantenimiento.
  if (console.status !== 'disponible') {
    return {
      ok: false,
      reason: 'consola_no_disponible',
      status: console.status,
      message: `${console.name} está ${STATUS_LABELS[console.status]}`,
    };
  }

  // Escenario 2: mandos insuficientes.
  const available = await countOperationalControllers(consoleId);
  if (available < controllerCount) {
    return {
      ok: false,
      reason: 'mandos_insuficientes',
      available,
      alternatives: await findAlternatives(consoleId, console.consoleType, controllerCount),
      message: `${console.name} solo tiene ${available} mandos operativos`,
    };
  }

  const rates = await getRateBlocks(console.consoleType);
  if (rates.length === 0) {
    throw new Error(`No hay tarifas para ${console.consoleType}`);
  }

  // Escenario 1: sesión creada, consola en juego y mandos descontados.
  try {
    const session = await openSession(
      {
        consoleId,
        rateSnapshot: rates,
        controllerCount,
        mode,
        durationMs: MODE_DURATION_MS[mode],
        totalCents: estimateTotalCents(console.consoleType, mode, controllerCount, rates),
      },
      now,
    );
    return { ok: true, session };
  } catch (e) {
    // Otro toque ocupó la consola o sus mandos entre la validación y la transacción.
    if (e instanceof ConsoleNotAvailableError || e instanceof InsufficientControllersError) {
      return startSession(rawInput, now);
    }
    throw e;
  }
}

export type { ActiveSession };

// Tarifario de un tipo de consola, para que el diálogo calcule el total en vivo (T14).
export async function listRateBlocks(consoleType: ConsoleType): Promise<RateBlock[]> {
  return getRateBlocks(consoleType);
}

// Sesiones activas guardadas en SQLite (HU-002, TW-86). Se leen al abrir la app, así después de
// cerrarla o reiniciar el celular cada consola vuelve a mostrar su sesión con el tiempo real,
// que se calcula desde started_at.
export async function listActiveSessions(): Promise<ActiveSession[]> {
  return getActiveSessionsWithConsole();
}
