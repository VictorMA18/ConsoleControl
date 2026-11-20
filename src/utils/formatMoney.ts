// Formatea céntimos como soles, por ejemplo 1450 → "S/ 14.50".
export function formatMoney(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`;
}

// Con signo, para diferencias de caja: +S/ 5.00 sobra, -S/ 5.00 falta.
export function formatSignedMoney(cents: number): string {
  return `${cents < 0 ? '-' : '+'}${formatMoney(Math.abs(cents))}`;
}
