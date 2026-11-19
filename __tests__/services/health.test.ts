import {
  addUsageMinutes,
  canChangeConsoleHealth,
  consoleLight,
  controllerLight,
  formatUsage,
  isConsoleAssignable,
  isControllerAssignable,
} from '../../src/services/health';

describe('HU-012 · semáforo de salud', () => {
  it('RN-06: lo que está en mantenimiento o averiado queda fuera de la asignación', () => {
    expect(isConsoleAssignable('disponible')).toBe(true);
    expect(isConsoleAssignable('mantenimiento')).toBe(false);
    expect(isConsoleAssignable('averiado')).toBe(false);

    expect(isControllerAssignable('operativo')).toBe(true);
    expect(isControllerAssignable('mantenimiento')).toBe(false);
    expect(isControllerAssignable('averiado')).toBe(false);
  });

  it('el color del semáforo sigue al estado', () => {
    expect(consoleLight('en_juego')).toBe('verde');
    expect(consoleLight('mantenimiento')).toBe('ambar');
    expect(controllerLight('averiado')).toBe('rojo');
  });

  it('una consola en juego no cambia de estado desde el semáforo', () => {
    expect(canChangeConsoleHealth('en_juego')).toBe(false);
    expect(canChangeConsoleHealth('averiado')).toBe(true);
  });

  it('addUsage suma los minutos jugados a las horas acumuladas', () => {
    expect(addUsageMinutes(120, 45)).toBe(165);
    expect(addUsageMinutes(120, 0)).toBe(120);
    expect(addUsageMinutes(120, -5)).toBe(120);
    expect(formatUsage(165)).toBe('2 h 45 min');
  });
});
