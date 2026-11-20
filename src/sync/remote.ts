import type { RemoteStore } from './remoteStore';

// La nube a la que se respalda. Hasta configurar Supabase (HU-008c) no hay ninguna: el motor no
// envía nada y el indicador lo dice.
export function getRemoteStore(): RemoteStore | null {
  return null;
}
