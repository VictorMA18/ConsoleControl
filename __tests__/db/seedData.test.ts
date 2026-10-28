import { CONSOLE_TYPES, RATE_BLOCK_MINUTES } from '../../src/db/schema/enums';
import {
  CONTROLLERS_PER_CONSOLE,
  seedConsoles,
  seedControllers,
  seedRates,
} from '../../src/db/seedData';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('datos iniciales', () => {
  it('usa UUID únicos en todas las tablas', () => {
    const ids = [...seedConsoles, ...seedControllers, ...seedRates].map((row) => row.id);
    ids.forEach((id) => expect(id).toMatch(UUID));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('incluye una consola de cada tipo con nombre único', () => {
    expect(seedConsoles.map((c) => c.consoleType).sort()).toEqual([...CONSOLE_TYPES].sort());
    const names = seedConsoles.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('asigna los mandos a consolas existentes', () => {
    const consoleIds = new Set(seedConsoles.map((c) => c.id));
    seedControllers.forEach((controller) =>
      expect(consoleIds.has(controller.consoleId)).toBe(true),
    );
    seedConsoles.forEach((console) => {
      const count = seedControllers.filter((c) => c.consoleId === console.id).length;
      expect(count).toBe(CONTROLLERS_PER_CONSOLE);
    });
  });

  it('tiene una tarifa por cada tipo de consola y bloque de tiempo', () => {
    CONSOLE_TYPES.forEach((type) =>
      RATE_BLOCK_MINUTES.forEach((minutes) => {
        const matches = seedRates.filter(
          (r) => r.consoleType === type && r.blockMinutes === minutes,
        );
        expect(matches).toHaveLength(1);
      }),
    );
    expect(seedRates).toHaveLength(CONSOLE_TYPES.length * RATE_BLOCK_MINUTES.length);
  });

  it('guarda los montos como centavos enteros positivos', () => {
    seedRates.forEach((rate) => {
      expect(Number.isInteger(rate.priceCents)).toBe(true);
      expect(rate.priceCents).toBeGreaterThan(0);
      expect(Number.isInteger(rate.extraControllerCents)).toBe(true);
      expect(rate.extraControllerCents).toBeGreaterThanOrEqual(0);
    });
  });
});
