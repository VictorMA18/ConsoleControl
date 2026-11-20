import type { MaintenanceKind } from '../db/schema/enums';

// Alertas de mantenimiento preventivo (HU-014). Funciones puras, sin base de datos.

// Umbrales en horas de uso desde la última intervención de cada tipo. HU-013 (Sprint 4) los hará
// configurables; mientras tanto son constantes con nombre.
export const CLEANING_THRESHOLD_HOURS = 150;
export const THERMAL_PASTE_THRESHOLD_HOURS = 500;

export type MaintenanceThresholds = Record<MaintenanceKind, number>;

// En minutos, como usage_minutes.
export const DEFAULT_THRESHOLDS: MaintenanceThresholds = {
  limpieza: CLEANING_THRESHOLD_HOURS * 60,
  pasta_termica: THERMAL_PASTE_THRESHOLD_HOURS * 60,
};

export const MAINTENANCE_LABELS: Record<MaintenanceKind, string> = {
  limpieza: 'Limpieza',
  pasta_termica: 'Pasta térmica',
};

export type UsageConsole = { id: string; name: string; usageMinutes: number };
export type MaintenanceRecord = {
  consoleId: string;
  kind: MaintenanceKind;
  usageMinutesAt: number;
};

export type MaintenanceStatus = {
  consoleId: string;
  consoleName: string;
  kind: MaintenanceKind;
  // Minutos de uso desde la última intervención de este tipo (o desde siempre).
  minutesSince: number;
  thresholdMinutes: number;
  due: boolean;
};

// Minutos de uso desde la última intervención de ese tipo. Las horas acumuladas no se borran: se
// resta lo que tenía la consola al intervenirla.
export function minutesSinceLast(
  console: UsageConsole,
  records: readonly MaintenanceRecord[],
  kind: MaintenanceKind,
): number {
  const last = records
    .filter((r) => r.consoleId === console.id && r.kind === kind)
    .reduce<number | null>(
      (max, r) => (max === null || r.usageMinutesAt > max ? r.usageMinutesAt : max),
      null,
    );
  return Math.max(0, console.usageMinutes - (last ?? 0));
}

// Estado de cada tipo de mantenimiento de cada consola, con el avance hacia su umbral.
export function getMaintenanceStatus(
  consoles: readonly UsageConsole[],
  records: readonly MaintenanceRecord[],
  thresholds: MaintenanceThresholds = DEFAULT_THRESHOLDS,
): MaintenanceStatus[] {
  return consoles.flatMap((console) =>
    (Object.keys(thresholds) as MaintenanceKind[]).map((kind) => {
      const minutesSince = minutesSinceLast(console, records, kind);
      return {
        consoleId: console.id,
        consoleName: console.name,
        kind,
        minutesSince,
        thresholdMinutes: thresholds[kind],
        due: minutesSince >= thresholds[kind],
      };
    }),
  );
}

// Solo las que ya alcanzaron su umbral: son las alertas que se muestran.
export function getMaintenanceAlerts(
  consoles: readonly UsageConsole[],
  records: readonly MaintenanceRecord[],
  thresholds: MaintenanceThresholds = DEFAULT_THRESHOLDS,
): MaintenanceStatus[] {
  return getMaintenanceStatus(consoles, records, thresholds).filter((s) => s.due);
}
