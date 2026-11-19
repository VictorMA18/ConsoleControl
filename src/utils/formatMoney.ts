// Formatea céntimos como soles, por ejemplo 1450 → "S/ 14.50".
export function formatMoney(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`;
}
