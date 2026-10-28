import type { Database } from './client';
import { consoles, controllers, rates } from './schema';
import { seedConsoles, seedControllers, seedRates } from './seedData';

// Carga los datos iniciales solo en las tablas vacías, así no duplica datos ni pisa cambios
// que el administrador haya hecho después del primer arranque. Las tarifas se revisan aparte:
// la migración 0001 vacía la tabla al cambiar al cobro por bloques (T13).
export function seedDatabase(db: Database): void {
  const hasConsoles = db.select({ id: consoles.id }).from(consoles).limit(1).all().length > 0;
  const hasRates = db.select({ id: rates.id }).from(rates).limit(1).all().length > 0;
  if (hasConsoles && hasRates) {
    return;
  }

  db.transaction((tx) => {
    if (!hasConsoles) {
      tx.insert(consoles).values(seedConsoles).run();
      tx.insert(controllers).values(seedControllers).run();
    }
    if (!hasRates) {
      tx.insert(rates).values(seedRates).run();
    }
  });
}
