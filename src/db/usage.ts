// Horas de uso acumuladas (HU-012). Función pura, sin base de datos, para que la use la
// transacción de cobro y se pueda probar sin SQLite.

// Suma los minutos jugados de una sesión a los acumulados. Nunca resta ni suma fracciones.
export function addUsageMinutes(currentMinutes: number, playedMinutes: number): number {
  return currentMinutes + Math.max(0, Math.floor(playedMinutes));
}
