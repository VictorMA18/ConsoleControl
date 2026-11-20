import { assertShiftEditable, isShiftLocked, ShiftClosedError } from '../../src/db/shiftLock';
import { AUDIT_THRESHOLD_CENTS, auditEntries, calculateBalance } from '../../src/services/balance';

const PAYMENTS = [
  { method: 'efectivo', amountCents: 1000 },
  { method: 'efectivo', amountCents: 500 },
  { method: 'yape', amountCents: 700 },
  { method: 'plin', amountCents: 300 },
  { method: 'fiado', amountCents: 400 },
] as const;

describe('calculateBalance (HU-007)', () => {
  it('con el efectivo contado igual, menor o mayor da Conforme, Faltante o Sobrante', () => {
    expect(calculateBalance(PAYMENTS, 1500)).toMatchObject({
      status: 'conforme',
      differenceCents: 0,
    });
    expect(calculateBalance(PAYMENTS, 1000)).toMatchObject({
      status: 'faltante',
      differenceCents: -500,
    });
    expect(calculateBalance(PAYMENTS, 1700)).toMatchObject({
      status: 'sobrante',
      differenceCents: 200,
    });
  });

  it('separa efectivo, Yape y Plin, y fiado', () => {
    expect(calculateBalance(PAYMENTS, 1500)).toMatchObject({
      cashCents: 1500,
      digitalCents: 1000,
      creditCents: 400,
      totalCents: 2900,
    });
  });

  it('pide la lista de auditoría solo si la diferencia supera S/ 2.00', () => {
    expect(AUDIT_THRESHOLD_CENTS).toBe(200);
    expect(calculateBalance(PAYMENTS, 1700).needsAudit).toBe(false);
    expect(calculateBalance(PAYMENTS, 1701).needsAudit).toBe(true);
    expect(calculateBalance(PAYMENTS, 1000).needsAudit).toBe(true);
  });

  it('la auditoría lista los cobros modificados y los fiados', () => {
    const list = [
      { method: 'efectivo', amountCents: 1000, modifiedAt: null },
      { method: 'efectivo', amountCents: 500, modifiedAt: 1_760_000_000_000 },
      { method: 'fiado', amountCents: 400, modifiedAt: null },
    ] as const;
    expect(auditEntries(list)).toHaveLength(2);
  });
});

describe('cierre inmutable (RN-05)', () => {
  it('un turno cerrado rechaza cambiar un pago, pero permite actualizar sync_status', () => {
    const closed = { status: 'cerrado' } as const;
    expect(isShiftLocked(closed)).toBe(true);
    expect(() => assertShiftEditable(closed, ['amountCents'])).toThrow(ShiftClosedError);
    expect(() => assertShiftEditable(closed, ['syncStatus', 'updatedAt'])).not.toThrow();
    expect(() => assertShiftEditable({ status: 'abierto' }, ['amountCents'])).not.toThrow();
  });
});
