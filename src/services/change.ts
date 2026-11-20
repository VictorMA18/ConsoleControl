// Vuelto en efectivo (HU-010). Funciones puras en céntimos enteros: nunca decimales.

export type ChangeResult = {
  // Lo que se devuelve al cliente. Cero si lo entregado no alcanza.
  changeCents: number;
  // Lo que falta para completar el total. Cero si alcanza o sobra.
  missingCents: number;
};

// Si lo entregado es menor al total devuelve el faltante, nunca un vuelto negativo.
export function calculateChange(totalCents: number, tenderedCents: number): ChangeResult {
  const difference = tenderedCents - totalCents;
  return difference >= 0
    ? { changeCents: difference, missingCents: 0 }
    : { changeCents: 0, missingCents: -difference };
}

// Convierte lo digitado en el teclado ("20", "7.5", "12.50") a céntimos. Texto vacío = 0.
export function parseTendered(text: string): number {
  const [whole = '', decimals = ''] = text.split('.');
  const soles = Number(whole || '0');
  const cents = Number(decimals.padEnd(2, '0').slice(0, 2) || '0');
  return soles * 100 + cents;
}
