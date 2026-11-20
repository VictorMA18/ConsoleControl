import {
  getMaintenanceAlerts,
  type MaintenanceRecord,
  minutesSinceLast,
} from '../../src/services/maintenanceAlerts';

const HOUR = 60;
const maq1 = { id: 'maq-1', name: 'MAQ #1', usageMinutes: 0 };

describe('HU-014 · alerta de mantenimiento preventivo', () => {
  it('bajo el umbral no hay alerta; al llegar a 150 h desde la última limpieza, sí', () => {
    expect(getMaintenanceAlerts([{ ...maq1, usageMinutes: 149 * HOUR }], [])).toEqual([]);

    const alerts = getMaintenanceAlerts([{ ...maq1, usageMinutes: 150 * HOUR }], []);

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ consoleId: 'maq-1', kind: 'limpieza', due: true });
  });

  it('registrar la limpieza pone el contador en cero sin perder las horas acumuladas', () => {
    const console = { ...maq1, usageMinutes: 160 * HOUR };
    const cleaning: MaintenanceRecord = {
      consoleId: 'maq-1',
      kind: 'limpieza',
      usageMinutesAt: 160 * HOUR,
    };

    expect(minutesSinceLast(console, [cleaning], 'limpieza')).toBe(0);
    expect(getMaintenanceAlerts([console], [cleaning])).toEqual([]);
    // Las horas totales siguen intactas y la pasta térmica cuenta desde siempre.
    expect(console.usageMinutes).toBe(160 * HOUR);
    expect(minutesSinceLast(console, [cleaning], 'pasta_termica')).toBe(160 * HOUR);
  });

  it('a las 500 h pide también el cambio de pasta térmica', () => {
    const kinds = getMaintenanceAlerts([{ ...maq1, usageMinutes: 500 * HOUR }], []).map(
      (a) => a.kind,
    );

    expect(kinds).toEqual(['limpieza', 'pasta_termica']);
  });
});
