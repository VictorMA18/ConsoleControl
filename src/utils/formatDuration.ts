// Formatea una duración en milisegundos como hh:mm:ss, por ejemplo 01:05:09.
// Las fracciones de segundo se descartan y los valores negativos se muestran como 00:00:00.
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
