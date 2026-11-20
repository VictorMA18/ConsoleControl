const DAY_MS = 24 * 60 * 60 * 1000;

// Inicio (incluido) y fin (excluido) del día local que contiene la hora dada, en milisegundos.
export function dayBounds(now: number = Date.now()): { from: number; to: number } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return { from: start.getTime(), to: start.getTime() + DAY_MS };
}
