import { calculateChange, parseTendered } from '../../src/services/change';

describe('calculateChange (HU-010)', () => {
  it('con entrega mayor o igual al total devuelve el vuelto exacto (cero si es igual)', () => {
    expect(calculateChange(1450, 2000)).toEqual({ changeCents: 550, missingCents: 0 });
    expect(calculateChange(1450, 1450)).toEqual({ changeCents: 0, missingCents: 0 });
  });

  it('con entrega menor al total devuelve el faltante, no un vuelto negativo', () => {
    expect(calculateChange(1450, 1000)).toEqual({ changeCents: 0, missingCents: 450 });
  });

  it('convierte lo digitado a céntimos', () => {
    expect(parseTendered('20')).toBe(2000);
    expect(parseTendered('7.5')).toBe(750);
    expect(parseTendered('12.50')).toBe(1250);
    expect(parseTendered('')).toBe(0);
  });
});
