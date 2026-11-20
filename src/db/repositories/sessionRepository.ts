import { and, asc, eq, inArray, type SQL } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import {
  type Console,
  consoles,
  controllers,
  type NewSession,
  payments,
  type Session,
  sessionExtensions,
  sessions,
  shifts,
} from '../schema';
import { assertShiftEditable } from '../shiftLock';

export class ConsoleNotAvailableError extends Error {
  constructor() {
    super('La consola ya no está disponible');
    this.name = 'ConsoleNotAvailableError';
  }
}

export class InsufficientControllersError extends Error {
  constructor() {
    super('La consola ya no tiene mandos operativos suficientes');
    this.name = 'InsufficientControllersError';
  }
}

// El repositorio asigna id, hora de inicio, estado y columnas de control. La copia de las
// tarifas es obligatoria aunque la columna tenga valor por defecto (RN-08).
export type CreateSessionInput = Pick<
  NewSession,
  'consoleId' | 'controllerCount' | 'mode' | 'durationMs' | 'totalCents'
> &
  Required<Pick<NewSession, 'rateSnapshot'>>;

export type SessionChanges = Partial<
  Pick<NewSession, 'controllerCount' | 'durationMs' | 'endedAt' | 'status' | 'totalCents'>
>;

// La sesión se guarda antes de mostrar el cronómetro (ADR 0003).
export async function createSession(
  input: CreateSessionInput,
  now: number = Date.now(),
): Promise<Session> {
  return db
    .insert(sessions)
    .values({ ...input, id: randomUUID(), startedAt: now, status: 'activa' })
    .returning()
    .get();
}

// Abre una sesión en una sola transacción (HU-001, escenario 1): ocupa la consola, marca los
// mandos como 'en_uso' y crea la sesión. Si la consola dejó de estar disponible o faltan mandos
// (por ejemplo, por un doble toque), lanza un error y no se guarda nada.
export async function openSession(
  input: CreateSessionInput,
  now: number = Date.now(),
): Promise<Session> {
  return db.transaction((tx) => {
    const claimed = tx
      .update(consoles)
      .set({ status: 'en_juego' })
      .where(and(eq(consoles.id, input.consoleId), eq(consoles.status, 'disponible')))
      .returning({ id: consoles.id })
      .get();
    if (!claimed) {
      throw new ConsoleNotAvailableError();
    }

    const controllerIds = tx
      .select({ id: controllers.id })
      .from(controllers)
      .where(and(eq(controllers.consoleId, input.consoleId), eq(controllers.status, 'operativo')))
      .orderBy(asc(controllers.label))
      .limit(input.controllerCount)
      .all()
      .map((row) => row.id);
    if (controllerIds.length < input.controllerCount) {
      throw new InsufficientControllersError();
    }

    tx.update(controllers)
      .set({ status: 'en_uso' })
      .where(inArray(controllers.id, controllerIds))
      .run();

    return tx
      .insert(sessions)
      .values({ ...input, id: randomUUID(), startedAt: now, status: 'activa' })
      .returning()
      .get();
  });
}

// Resultado de la liquidación que se guarda al finalizar (HU-005).
export type SettlementResult = Required<
  Pick<NewSession, 'playedMinutes' | 'chargedMinutes' | 'penaltyCents' | 'totalCents'>
>;

// Finaliza una sesión activa y la deja "por cobrar" (HU-005) con su liquidación. La consola y los
// mandos siguen ocupados hasta que se registre el pago (HU-006). Es una sola sentencia, así que
// es atómica; si la sesión ya no estaba activa devuelve undefined.
export async function endSession(
  id: string,
  result: SettlementResult,
  now: number = Date.now(),
): Promise<Session | undefined> {
  return db
    .update(sessions)
    .set({ ...result, status: 'por_cobrar', endedAt: now })
    .where(and(eq(sessions.id, id), eq(sessions.status, 'activa')))
    .returning()
    .get();
}

// Cierra una sesión sin cobrarla y libera su consola y sus mandos en una sola transacción.
export type SessionExtensionChange = {
  minutes: number;
  // Duración que tenía la sesión al calcular la extensión: si cambió mientras tanto (otro toque),
  // no se aplica para no sumar dos veces.
  previousDurationMs: number;
  previousTotalCents: number;
  durationMs: number;
  totalCents: number;
};

// Añade tiempo a una sesión activa (HU-009): actualiza su duración y su monto estimado y guarda
// la extensión en el historial, todo en una transacción. Devuelve undefined si la sesión ya no
// está activa o su duración cambió.
export async function extendSessionDuration(
  id: string,
  change: SessionExtensionChange,
): Promise<Session | undefined> {
  return db.transaction((tx) => {
    const session = tx
      .update(sessions)
      .set({ durationMs: change.durationMs, totalCents: change.totalCents })
      .where(
        and(
          eq(sessions.id, id),
          eq(sessions.status, 'activa'),
          eq(sessions.durationMs, change.previousDurationMs),
        ),
      )
      .returning()
      .get();
    if (!session) {
      return undefined;
    }
    tx.insert(sessionExtensions)
      .values({
        id: randomUUID(),
        sessionId: id,
        minutes: change.minutes,
        previousTotalCents: change.previousTotalCents,
        newTotalCents: change.totalCents,
      })
      .run();
    return session;
  });
}

// Solo lo usan las herramientas de desarrollo; el cierre normal es endSession + el cobro (HU-006).
export async function finishSession(
  id: string,
  now: number = Date.now(),
): Promise<Session | undefined> {
  return db.transaction((tx) => {
    const session = tx
      .update(sessions)
      .set({ status: 'finalizada', endedAt: now })
      .where(and(eq(sessions.id, id), inArray(sessions.status, ['activa', 'por_cobrar'])))
      .returning()
      .get();
    if (!session) {
      return undefined;
    }

    tx.update(consoles)
      .set({ status: 'disponible' })
      .where(and(eq(consoles.id, session.consoleId), eq(consoles.status, 'en_juego')))
      .run();
    tx.update(controllers)
      .set({ status: 'operativo' })
      .where(and(eq(controllers.consoleId, session.consoleId), eq(controllers.status, 'en_uso')))
      .run();

    return session;
  });
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  return db.select().from(sessions).where(eq(sessions.id, id)).get();
}

// Sesiones a restaurar al abrir la app (HU-002).
export async function getActiveSessions(): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.status, 'activa'))
    .orderBy(asc(sessions.startedAt))
    .all();
}

export type ActiveSession = Session & Pick<Console, 'consoleType'> & { consoleName: string };

function selectWithConsole(condition: SQL | undefined): ActiveSession[] {
  const rows = db
    .select({ session: sessions, consoleName: consoles.name, consoleType: consoles.consoleType })
    .from(sessions)
    .innerJoin(consoles, eq(sessions.consoleId, consoles.id))
    .where(condition)
    .orderBy(asc(sessions.startedAt))
    .all();
  return rows.map((row) => ({
    ...row.session,
    consoleName: row.consoleName,
    consoleType: row.consoleType,
  }));
}

// Sesiones activas con el nombre y tipo de su consola, para mostrarlas en el muro (HU-002).
export async function getActiveSessionsWithConsole(): Promise<ActiveSession[]> {
  return selectWithConsole(eq(sessions.status, 'activa'));
}

// Sesiones finalizadas que esperan su pago (HU-005): su consola sigue ocupada en el muro.
export async function getPendingSessionsWithConsole(): Promise<ActiveSession[]> {
  return selectWithConsole(eq(sessions.status, 'por_cobrar'));
}

export async function getSessionWithConsole(id: string): Promise<ActiveSession | undefined> {
  return selectWithConsole(eq(sessions.id, id))[0];
}

// updated_at y sync_status se actualizan solos (controlColumns.ts).
export async function updateSession(
  id: string,
  changes: SessionChanges,
): Promise<Session | undefined> {
  // RN-05: la sesión de un turno cerrado es de solo lectura, salvo lo que necesita la sincronización.
  const closedShift = db
    .select({ status: shifts.status })
    .from(payments)
    .innerJoin(shifts, eq(payments.shiftId, shifts.id))
    .where(and(eq(payments.sessionId, id), eq(shifts.status, 'cerrado')))
    .get();
  if (closedShift) {
    assertShiftEditable(closedShift, Object.keys(changes));
  }
  return db.update(sessions).set(changes).where(eq(sessions.id, id)).returning().get();
}
