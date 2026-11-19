import type { PaymentMethod } from '../db/schema/enums';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
  fiado: 'Fiado',
};
