import { z } from 'zod';

import { PAYMENT_METHODS } from '../db/schema/enums';
import { formatMoney } from '../utils/formatMoney';

// Pago de una sesión por uno o varios métodos (HU-006, RN-04). Los montos son céntimos enteros.
export const paymentLineSchema = z.object({
  method: z.enum(PAYMENT_METHODS, { error: 'Elige un método de pago' }),
  amountCents: z.number().int().positive('Cada monto debe ser mayor a cero'),
  // Solo para 'fiado'.
  customerName: z.string().trim().max(60).optional(),
});

export type PaymentLineInput = z.infer<typeof paymentLineSchema>;

// Las líneas deben tener al menos un método, sin repetirse, y sumar exactamente el total.
export function paymentLinesSchemaFor(totalCents: number) {
  return z
    .array(paymentLineSchema)
    .min(1, 'Elige al menos un método de pago')
    .superRefine((lines, ctx) => {
      const methods = lines.map((line) => line.method);
      if (new Set(methods).size !== methods.length) {
        ctx.addIssue({ code: 'custom', message: 'Un método de pago no puede repetirse' });
      }
      const sum = lines.reduce((total, line) => total + line.amountCents, 0);
      if (sum < totalCents) {
        ctx.addIssue({ code: 'custom', message: `Faltan ${formatMoney(totalCents - sum)}` });
      } else if (sum > totalCents) {
        ctx.addIssue({ code: 'custom', message: `Sobran ${formatMoney(sum - totalCents)}` });
      }
    });
}

export function paymentSchemaFor(totalCents: number) {
  return z.object({ sessionId: z.uuid(), payments: paymentLinesSchemaFor(totalCents) });
}

export type RegisterPaymentInput = z.infer<ReturnType<typeof paymentSchemaFor>>;
