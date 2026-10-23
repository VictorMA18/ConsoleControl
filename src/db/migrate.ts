import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import { db } from './client';
import migrations from './migrations/migrations';
import { seedDatabase } from './seed';

type DatabaseSetupState = { ready: boolean; error?: Error };

// Prepara la base al abrir la app: aplica las migraciones pendientes y, en el primer
// arranque, carga los datos iniciales. La interfaz usa este hook sin importar drizzle-orm
// (regla de capas de AGENTS.md).
export function useDatabaseSetup(): DatabaseSetupState {
  const [state, setState] = useState<DatabaseSetupState>({ ready: false });

  useEffect(() => {
    migrate(db, migrations)
      .then(() => {
        seedDatabase(db);
        setState({ ready: true });
      })
      .catch((e: unknown) => {
        setState({ ready: false, error: e instanceof Error ? e : new Error(String(e)) });
      });
  }, []);

  return state;
}
