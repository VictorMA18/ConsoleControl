import {
  getPaymentTotalsByMethod,
  type MethodTotal,
  registerPayments,
  SessionNotPayableError,
} from '../db/repositories/paymentRepository';
import { getSessionWithConsole } from '../db/repositories/sessionRepository';
import type { Session } from '../db/schema';
import { paymentSchemaFor } from '../schemas/payment';
import { dayBounds } from '../utils/day';

export type RegisterPaymentResult =
  | { ok: true; session: Session }
  | {
      ok: false;
      reason: 'datos_invalidos' | 'sesion_no_encontrada' | 'sesion_no_por_cobrar';
      message: string;
    };

// Cobra una sesión (HU-006, CU-002). Valida con Zod que haya al menos un método y que la suma sea
// exactamente el total de la liquidación de HU-005; solo entonces libera la consola (RN-04).
export async function registerPayment(rawInput: unknown): Promise<RegisterPaymentResult> {
  const sessionId = (rawInput as { sessionId?: unknown } | null)?.sessionId;
  const session =
    typeof sessionId === 'string' ? await getSessionWithConsole(sessionId) : undefined;
  if (!session) {
    return { ok: false, reason: 'sesion_no_encontrada', message: 'La sesión no existe' };
  }
  if (session.status !== 'por_cobrar') {
    return { ok: false, reason: 'sesion_no_por_cobrar', message: 'La sesión no está por cobrar' };
  }

  const parsed = paymentSchemaFor(session.totalCents).safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'datos_invalidos',
      message: parsed.error.issues[0]?.message ?? 'El pago no es válido',
    };
  }

  try {
    return { ok: true, session: await registerPayments(session.id, parsed.data.payments) };
  } catch (e) {
    if (e instanceof SessionNotPayableError) {
      return { ok: false, reason: 'sesion_no_por_cobrar', message: e.message };
    }
    throw e;
  }
}

// Caja del día: lo cobrado hoy separado por método (HU-006; la usa el arqueo de HU-007).
export async function getDailyTotals(now: number = Date.now()): Promise<MethodTotal[]> {
  const { from, to } = dayBounds(now);
  return getPaymentTotalsByMethod(from, to);
}
