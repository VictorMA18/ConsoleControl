import type { RemoteStore } from './remoteStore';
import { SupabaseRemoteStore } from './supabaseRemoteStore';

// La nube a la que se respalda (HU-008c). Se configura con EXPO_PUBLIC_SUPABASE_URL y
// EXPO_PUBLIC_SUPABASE_ANON_KEY en un .env fuera del repositorio (docs/guides/supabase.md). Sin
// ellas no hay nube: el motor no envía nada y el indicador muestra «Sin nube».
let remote: RemoteStore | null | undefined;

export function getRemoteStore(): RemoteStore | null {
  if (remote === undefined) {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    remote = url && key ? new SupabaseRemoteStore(url, key) : null;
  }
  return remote;
}
