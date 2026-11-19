import { paymentLinesSchemaFor } from '../../src/schemas/payment';

const TOTAL = 1450;
const schema = paymentLinesSchemaFor(TOTAL);

describe('validación del pago (HU-006)', () => {
  it('acepta un pago mixto cuya suma es el total', () => {
    const result = schema.safeParse([
      { method: 'efectivo', amountCents: 1000 },
      { method: 'yape', amountCents: 450 },
    ]);
    expect(result.success).toBe(true);
  });

  it('rechaza un pago mixto que no suma el total', () => {
    const result = schema.safeParse([
      { method: 'efectivo', amountCents: 1000 },
      { method: 'yape', amountCents: 400 },
    ]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Faltan S/ 0.50');
  });

  it('rechaza el pago sin método (RN-04) y los montos en cero o negativos', () => {
    expect(schema.safeParse([]).success).toBe(false);
    expect(schema.safeParse([{ method: 'efectivo', amountCents: 0 }]).success).toBe(false);
    expect(schema.safeParse([{ method: 'plin', amountCents: -1450 }]).success).toBe(false);
  });
});
