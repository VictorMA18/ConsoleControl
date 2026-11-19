import { z } from 'zod';

import {
  closeShift,
  getAuditPayments,
  getClosedShifts,
  getOpenShift,
  getShiftPayments,
} from '../db/repositories/shiftRepository';
import type { Payment, Shift } from '../db/schema';
import { type Balance, calculateBalance } from './balance';

// Turno actual con sus cobros, para mostrar la caja del día y calcular el balance en pantalla.
export type ShiftOverview = { shift: Shift | null; payments: Payment[] };

export async function getShiftOverview(): Promise<ShiftOverview> {
  const shift = (await getOpenShift()) ?? null;
  return { shift, payments: shift ? await getShiftPayments(shift.id) : [] };
}

export async function listClosedShifts(): Promise<Shift[]> {
  return getClosedShifts();
}

const countedSchema = z.number().int().min(0);

export type CloseShiftResult =
  | { ok: true; shift: Shift; balance: Balance; audit: Payment[] }
  | { ok: false; reason: 'datos_invalidos' | 'sin_turno_abierto'; message: string };

// Cierra el turno y concilia la caja (HU-007, CU-003): compara el efectivo contado con lo
// registrado, guarda el resumen y deja los registros del turno en solo lectura (RN-05).
export async function closeCurrentShift(
  countedCashCents: number,
  now: number = Date.now(),
): Promise<CloseShiftResult> {
  if (!countedSchema.safeParse(countedCashCents).success) {
    return { ok: false, reason: 'datos_invalidos', message: 'El efectivo contado no es válido' };
  }
  const shift = await getOpenShift();
  if (!shift) {
    return { ok: false, reason: 'sin_turno_abierto', message: 'No hay un turno abierto' };
  }

  const balance = calculateBalance(await getShiftPayments(shift.id), countedCashCents);
  const closed = await closeShift(
    shift.id,
    {
      cashCents: balance.cashCents,
      digitalCents: balance.digitalCents,
      creditCents: balance.creditCents,
      countedCashCents,
      differenceCents: balance.differenceCents,
      balance: balance.status,
    },
    now,
  );
  if (!closed) {
    return { ok: false, reason: 'sin_turno_abierto', message: 'El turno ya estaba cerrado' };
  }
  return {
    ok: true,
    shift: closed,
    balance,
    audit: balance.needsAudit ? await getAuditPayments(shift.id) : [],
  };
}
