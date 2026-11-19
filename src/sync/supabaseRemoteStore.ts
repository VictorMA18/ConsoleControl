import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Storage from 'expo-sqlite/kv-store';

import type { RemoteStore } from './remoteStore';
import type { SyncRecord, SyncTable } from './types';

// Respaldo real en Supabase (HU-008c, ADR 0016). Cada instalación inicia sesión anónima en
// Supabase Auth (sin pantalla de login) y sus filas llevan owner_id = su usuario: RLS solo le deja
// leer y escribir las propias. La sesión anónima se guarda en el almacén clave-valor de
// expo-sqlite, así el mismo dispositivo conserva su dueño entre reinicios.
export class SupabaseRemoteStore implements RemoteStore {
  private readonly client: SupabaseClient;

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey, {
      auth: {
        storage: Storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  // Usuario anónimo de este dispositivo; lo crea la primera vez.
  private async ownerId(): Promise<string> {
    const { data } = await this.client.auth.getSession();
    if (data.session) {
      return data.session.user.id;
    }
    const { data: signIn, error } = await this.client.auth.signInAnonymously();
    if (error || !signIn.user) {
      throw new Error(error?.message ?? 'No se pudo iniciar la sesión anónima');
    }
    return signIn.user.id;
  }

  // Upsert por (owner_id, id): reenviar un registro lo reemplaza, no lo duplica. sync_status no
  // viaja: solo tiene sentido en el teléfono.
  async upsertRecords(table: SyncTable, records: readonly SyncRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }
    const owner = await this.ownerId();
    const rows = records.map(({ sync_status: _local, ...row }) => ({ ...row, owner_id: owner }));
    const { error } = await this.client.from(table).upsert(rows, { onConflict: 'owner_id,id' });
    if (error) {
      throw new Error(error.message);
    }
  }
}
