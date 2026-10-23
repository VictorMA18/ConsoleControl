import {
  type ConsoleWithStock,
  countOperationalControllers,
  getAvailableConsolesWithStock,
  getConsoleById,
} from '../db/repositories/consoleRepository';
import { getRate } from '../db/repositories/rateRepository';
import {
  ConsoleNotAvailableError,
  InsufficientControllersError,
  openSession,
} from '../db/repositories/sessionRepository';
import type { ConsoleStatus, SessionMode } from '../db/schema/enums';
import type { Rate, Session } from '../db/schema';
import { startSessionSchema } from '../schemas/session';

export const MODE_DURATION_MS: Record<SessionMode, number | null> = {
  fijo_30: 30 * 60 * 1000,
  fijo_60: 60 * 60 * 1000,
  fijo_120: 120 * 60 * 1000,
  libre: null,
};

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

// Monto estimado al abrir la sesión (RN-01: recargo por cada mando a partir del segundo).
// En tiempo libre el monto se calcula al cerrar. Provisional hasta el motor de tarifas de T13.
function estimateTotalCents(rate: Rate, mode: SessionMode, controllerCount: number): number {
  if (mode === 'libre') {
    return 0;
  }
  return rate.priceCents + (controllerCount - 1) * rate.extraControllerCents;
}

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

  const rate = await getRate(console.consoleType, mode);
  if (!rate) {
    throw new Error(`No hay tarifa para ${console.consoleType} en modalidad ${mode}`);
  }

  // Escenario 1: sesión creada, consola en juego y mandos descontados.
  try {
    const session = await openSession(
      {
        consoleId,
        rateId: rate.id,
        controllerCount,
        mode,
        durationMs: MODE_DURATION_MS[mode],
        totalCents: estimateTotalCents(rate, mode, controllerCount),
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
