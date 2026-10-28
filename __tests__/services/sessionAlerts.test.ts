import {
  ALERT_BEFORE_MS,
  type AlertableSession,
  getSessionAlertState,
} from '../../src/services/sessionAlerts';

const START = 1_760_000_000_000;
const MINUTE = 60 * 1000;

const fixed30: AlertableSession = {
  startedAt: START,
  endedAt: null,
  durationMs: 30 * MINUTE,
  status: 'activa',
};

describe('getSessionAlertState · tiempo fijo de 30 min', () => {
  it.each([
    [0, 'en_curso'],
    [10 * MINUTE, 'en_curso'],
    // Un instante antes de que falten 5 minutos.
    [25 * MINUTE - 1, 'en_curso'],
    // Faltan exactamente 5 minutos (RN-02).
    [25 * MINUTE, 'proxima_a_vencer'],
    [27 * MINUTE, 'proxima_a_vencer'],
    // Falta 1 milisegundo.
    [30 * MINUTE - 1, 'proxima_a_vencer'],
    // Se agotó el tiempo.
    [30 * MINUTE, 'tiempo_cumplido'],
    [45 * MINUTE, 'tiempo_cumplido'],
  ] as const)('a los %i ms está %s', (elapsed, state) => {
    expect(getSessionAlertState(fixed30, START + elapsed)).toBe(state);
  });

  it('avisa 5 minutos antes del fin (RN-02)', () => {
    expect(ALERT_BEFORE_MS).toBe(5 * MINUTE);
  });
});

describe('getSessionAlertState · tiempo cumplido hasta la liquidación (TW-109)', () => {
  it('sigue en tiempo cumplido horas después mientras la sesión esté activa', () => {
    expect(getSessionAlertState(fixed30, START + 5 * 60 * MINUTE)).toBe('tiempo_cumplido');
  });

  it('deja de estar en tiempo cumplido al liquidarse la sesión', () => {
    const finished = { ...fixed30, endedAt: START + 40 * MINUTE, status: 'finalizada' as const };
    expect(getSessionAlertState(finished, START + 45 * MINUTE)).toBe('finalizada');
  });
});

describe('getSessionAlertState · otros casos', () => {
  it('en tiempo libre nunca alerta', () => {
    const free = { ...fixed30, durationMs: null };
    expect(getSessionAlertState(free, START)).toBe('libre');
    expect(getSessionAlertState(free, START + 10 * 60 * MINUTE)).toBe('libre');
  });

  it('una sesión de 5 minutos o menos empieza ya próxima a vencer', () => {
    const short = { ...fixed30, durationMs: 5 * MINUTE };
    expect(getSessionAlertState(short, START)).toBe('proxima_a_vencer');
  });

  it('si la hora del celular se atrasó antes del inicio, sigue en curso', () => {
    expect(getSessionAlertState(fixed30, START - 10 * MINUTE)).toBe('en_curso');
  });
});
