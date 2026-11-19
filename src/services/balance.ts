import type { BalanceStatus, PaymentMethod } from '../db/schema/enums';

// Arqueo de caja (HU-007, RN-05). Funciones puras en céntimos enteros.

// Si la diferencia supera este monto (S/ 2.00) se muestra la lista de auditoría. No decide si el
// balance es "Conforme": eso solo ocurre con diferencia exacta de cero (por confirmar con VN).
export const AUDIT_THRESHOLD_CENTS = 200;

type PaymentLike = { method: PaymentMethod; amountCents: number };

export type Balance = {
  // Efectivo que debería haber en caja: los cobros en efectivo del turno.
  cashCents: number;
  // Yape y Plin juntos.
  digitalCents: number;
  creditCents: number;
  totalCents: number;
  countedCashCents: number;
  // Contado menos esperado.
  differenceCents: number;
  status: BalanceStatus;
  needsAudit: boolean;
};

export function calculateBalance(
  payments: readonly PaymentLike[],
  countedCashCents: number,
): Balance {
  const sum = (methods: readonly PaymentMethod[]) =>
    payments
      .filter((payment) => methods.includes(payment.method))
      .reduce((total, payment) => total + payment.amountCents, 0);
  const cashCents = sum(['efectivo']);
  const digitalCents = sum(['yape', 'plin']);
  const creditCents = sum(['fiado']);
  const differenceCents = countedCashCents - cashCents;
  return {
    cashCents,
    digitalCents,
    creditCents,
    totalCents: cashCents + digitalCents + creditCents,
    countedCashCents,
    differenceCents,
    status: differenceCents === 0 ? 'conforme' : differenceCents < 0 ? 'faltante' : 'sobrante',
    needsAudit: Math.abs(differenceCents) > AUDIT_THRESHOLD_CENTS,
  };
}

type AuditablePayment = PaymentLike & { modifiedAt: number | null };

// Cobros que revisar cuando hay descuadre: los modificados y los de saldo pendiente (fiados).
export function auditEntries<T extends AuditablePayment>(payments: readonly T[]): T[] {
  return payments.filter((payment) => payment.modifiedAt !== null || payment.method === 'fiado');
}
