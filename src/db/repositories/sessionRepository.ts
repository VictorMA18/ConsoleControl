import { asc, eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '../client';
import { type NewSession, type Session, sessions } from '../schema';

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
