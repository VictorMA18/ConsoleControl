import { and, asc, eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import { consoles, controllers, type NewSession, type Session, sessions } from '../schema';

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

// El repositorio asigna id, hora de inicio, estado y columnas de control.
export type CreateSessionInput = Pick<
  NewSession,
  'consoleId' | 'rateId' | 'controllerCount' | 'mode' | 'durationMs' | 'totalCents'
>;

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

// Termina una sesión activa y libera su consola y sus mandos en una sola transacción.
// La liquidación y el cobro se agregan en HU-005.
export async function finishSession(
  id: string,
  now: number = Date.now(),
): Promise<Session | undefined> {
  return db.transaction((tx) => {
    const session = tx
      .update(sessions)
      .set({ status: 'finalizada', endedAt: now })
      .where(and(eq(sessions.id, id), eq(sessions.status, 'activa')))
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

// updated_at y sync_status se actualizan solos (controlColumns.ts).
export async function updateSession(
  id: string,
  changes: SessionChanges,
): Promise<Session | undefined> {
  return db.update(sessions).set(changes).where(eq(sessions.id, id)).returning().get();
}
