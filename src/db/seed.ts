import type { Database } from './client';
import { consoles, controllers, rates } from './schema';
import { seedConsoles, seedControllers, seedRates } from './seedData';

// Carga consolas, mandos y tarifas solo si la base está vacía, así no duplica datos
// ni pisa cambios que el administrador haya hecho después del primer arranque.
export function seedDatabase(db: Database): void {
  const existing = db.select({ id: consoles.id }).from(consoles).limit(1).all();
  if (existing.length > 0) {
    return;
  }

  db.transaction((tx) => {
    tx.insert(consoles).values(seedConsoles).run();
    tx.insert(controllers).values(seedControllers).run();
    tx.insert(rates).values(seedRates).run();
  });
}
