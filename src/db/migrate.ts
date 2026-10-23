import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from './client';
import migrations from './migrations/migrations';

// Aplica las migraciones pendientes al abrir la app. En el primer arranque crea la base.
// La interfaz usa este hook sin importar drizzle-orm (regla de capas de AGENTS.md).
export function useDatabaseMigrations(): { success: boolean; error?: Error } {
  return useMigrations(db, migrations);
}
