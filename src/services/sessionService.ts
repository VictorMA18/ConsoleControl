import {
  type ConsoleWithStock,
  countOperationalControllers,
  getAvailableConsolesWithStock,
  getConsoleById,
} from '../db/repositories/consoleRepository';
import { getRateBlocks, getRates } from '../db/repositories/rateRepository';
import {
  type ActiveSession,
  ConsoleNotAvailableError,
  endSession,
  extendSessionDuration,
  getActiveSessionsWithConsole,
  getPendingSessionsWithConsole,
  getSessionWithConsole,
  InsufficientControllersError,
  openSession,
} from '../db/repositories/sessionRepository';
import type { ConsoleStatus, ConsoleType } from '../db/schema/enums';
import type { RateBlock, Session } from '../db/schema';
import { startSessionSchema } from '../schemas/session';
import { planExtension, type ExtensionPlan } from './extension';
import { estimateTotalCents, MODE_DURATION_MS } from './sessionQuote';
import { calculateSettlement } from './settlement';

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

// Precio de una hora con un mando por tipo de consola, para la tarjeta libre del muro. Un tipo sin
// bloque de 60 minutos no aparece.
export async function listHourlyPrices(): Promise<Partial<Record<ConsoleType, number>>> {
  const prices: Partial<Record<ConsoleType, number>> = {};
  for (const rate of await getRates()) {
    if (rate.blockMinutes === 60) {
      prices[rate.consoleType] = rate.priceCents;
    }
  }
  return prices;
}

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

// Sesiones finalizadas que esperan su pago (HU-005). Siguen ocupando su consola en el muro.
export async function listPendingSessions(): Promise<ActiveSession[]> {
  return getPendingSessionsWithConsole();
}

export async function getSessionDetail(id: string): Promise<ActiveSession | undefined> {
  return getSessionWithConsole(id);
}

export type EndSessionResult =
  | { ok: true; session: Session }
  | { ok: false; reason: 'sesion_no_encontrada' | 'sesion_no_activa'; message: string };

// Finaliza una sesión activa (HU-005): calcula la liquidación con las tarifas guardadas en la
// sesión y la deja "por cobrar". El cobro y la liberación de la consola son de HU-006.
export async function endSessionForPayment(
  id: string,
  now: number = Date.now(),
): Promise<EndSessionResult> {
  const detail = await getSessionWithConsole(id);
  if (!detail) {
    return { ok: false, reason: 'sesion_no_encontrada', message: 'La sesión no existe' };
  }
  if (detail.status !== 'activa') {
    return { ok: false, reason: 'sesion_no_activa', message: 'La sesión ya fue finalizada' };
  }
  const settlement = calculateSettlement({
    consoleType: detail.consoleType,
    controllerCount: detail.controllerCount,
    durationMs: detail.durationMs,
    startedAt: detail.startedAt,
    endedAt: now,
    rates: detail.rateSnapshot,
  });
  const session = await endSession(
    id,
    {
      playedMinutes: settlement.playedMinutes,
      chargedMinutes: settlement.chargedMinutes,
      penaltyCents: settlement.penaltyCents,
      totalCents: settlement.totalCents,
    },
    now,
  );
  if (!session) {
    return { ok: false, reason: 'sesion_no_activa', message: 'La sesión ya fue finalizada' };
  }
  return { ok: true, session };
}

export type ExtendSessionResult =
  | { ok: true; session: Session }
  | {
      ok: false;
      reason: Extract<ExtensionPlan, { ok: false }>['reason'] | 'sesion_no_encontrada';
      message: string;
    };

// Añade 15 o 30 minutos a una sesión de tiempo fijo en curso (HU-009). El cronómetro sigue desde
// started_at; cambian el vencimiento y el monto estimado.
export async function extendSession(
  id: string,
  minutes: number,
  now: number = Date.now(),
): Promise<ExtendSessionResult> {
  const detail = await getSessionWithConsole(id);
  if (!detail) {
    return { ok: false, reason: 'sesion_no_encontrada', message: 'La sesión no existe' };
  }
  const plan = planExtension(detail, minutes, now);
  if (!plan.ok) {
    return plan;
  }
  const session = await extendSessionDuration(id, {
    minutes: plan.minutes,
    previousDurationMs: detail.durationMs as number,
    previousTotalCents: detail.totalCents,
    durationMs: plan.durationMs,
    totalCents: plan.totalCents,
  });
  if (!session) {
    return {
      ok: false,
      reason: 'sesion_no_activa',
      message: 'La sesión cambió mientras tanto: vuelve a intentarlo',
    };
  }
  return { ok: true, session };
}
