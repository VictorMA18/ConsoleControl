import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'consolecontrol.db';

const sqlite = openDatabaseSync(DATABASE_NAME);

// SQLite no valida claves foráneas si no se activan en cada conexión.
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
