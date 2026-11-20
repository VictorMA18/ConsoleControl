import type { ShiftStatus } from './schema/enums';

// Cierre inmutable (RN-05). Funciones puras, sin abrir la base, que usa la capa de acceso a datos
// para rechazar cambios a los registros de un turno cerrado.

export class ShiftClosedError extends Error {
  constructor() {
    super('El turno está cerrado: sus registros son de solo lectura');
    this.name = 'ShiftClosedError';
  }
}

// Lo único que puede cambiar en un registro de un turno cerrado: las columnas que la
// sincronización necesita para marcarlo como sincronizado (HU-008).
export const SYNC_ONLY_FIELDS: readonly string[] = ['syncStatus', 'updatedAt'];

export function isShiftLocked(shift: { status: ShiftStatus }): boolean {
  return shift.status === 'cerrado';
}

// Lanza ShiftClosedError si el turno está cerrado y el cambio toca algo más que la sincronización.
export function assertShiftEditable(
  shift: { status: ShiftStatus },
  changedFields: readonly string[],
): void {
  if (isShiftLocked(shift) && changedFields.some((field) => !SYNC_ONLY_FIELDS.includes(field))) {
    throw new ShiftClosedError();
  }
}
