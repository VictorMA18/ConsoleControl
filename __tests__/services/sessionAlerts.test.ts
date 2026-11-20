import {
  ALERT_BEFORE_MS,
  type AlertableSession,
  createAlertTracker,
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

describe('createAlertTracker · un aviso por sesión (TW-111) con reloj acelerado (TW-112)', () => {
  const session = {
    ...fixed30,
    id: 'b9037d51-e9c9-4dc5-862d-8757f82edf33',
    consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
    consoleName: 'PS4 #1',
  };

  it('avisa una sola vez de cada estado mientras pasa el tiempo, segundo a segundo', () => {
    const tracker = createAlertTracker();
    const alerts = [];
    // Simula los 40 minutos de la sesión revisando cada segundo, como el reloj compartido.
    for (let elapsed = 0; elapsed <= 40 * MINUTE; elapsed += 1000) {
      alerts.push(...tracker.check([session], START + elapsed));
    }

    expect(alerts.map((a) => a.type)).toEqual(['proxima_a_vencer', 'tiempo_cumplido']);
    expect(alerts[0]).toEqual({
      type: 'proxima_a_vencer',
      sessionId: session.id,
      consoleId: session.consoleId,
      consoleName: 'PS4 #1',
      remainingMs: 5 * MINUTE,
    });
    expect(alerts[1]).toMatchObject({ type: 'tiempo_cumplido', remainingMs: 0 });
  });

  it('avisa en el momento justo: no antes de que falten 5 minutos', () => {
    const tracker = createAlertTracker();
    expect(tracker.check([session], START + 25 * MINUTE - 1000)).toEqual([]);
    expect(tracker.check([session], START + 25 * MINUTE)).toHaveLength(1);
  });

  it('si la app vuelve con el tiempo ya cumplido, solo avisa del tiempo cumplido', () => {
    const tracker = createAlertTracker();
    tracker.check([session], START + 10 * MINUTE);

    const alerts = tracker.check([session], START + 35 * MINUTE);

    expect(alerts.map((a) => a.type)).toEqual(['tiempo_cumplido']);
  });

  it('al reabrir la app (rastreador nuevo) avisa otra vez de una sesión que sigue en alerta', () => {
    const first = createAlertTracker();
    expect(first.check([session], START + 26 * MINUTE)).toHaveLength(1);

    const afterReopen = createAlertTracker();
    expect(afterReopen.check([session], START + 27 * MINUTE)).toHaveLength(1);
  });

  it('separa los avisos de varias consolas', () => {
    const tracker = createAlertTracker();
    const other = { ...session, id: 'other', consoleName: 'PS5 #1', startedAt: START + MINUTE };

    const atMinute25 = tracker.check([session, other], START + 25 * MINUTE);
    const atMinute26 = tracker.check([session, other], START + 26 * MINUTE);

    expect(atMinute25.map((a) => a.consoleName)).toEqual(['PS4 #1']);
    expect(atMinute26.map((a) => a.consoleName)).toEqual(['PS5 #1']);
  });

  it('no avisa de sesiones de tiempo libre', () => {
    const tracker = createAlertTracker();
    const free = { ...session, durationMs: null };
    expect(tracker.check([free], START + 10 * 60 * MINUTE)).toEqual([]);
  });

  it('vuelve a avisar si la sesión se extiende y otra vez le faltan 5 minutos', () => {
    const tracker = createAlertTracker();
    expect(tracker.check([session], START + 26 * MINUTE)).toHaveLength(1);

    // Se extiende 30 minutos más (HU-009): vuelve a estar en curso.
    const extended = { ...session, durationMs: 60 * MINUTE };
    expect(tracker.check([extended], START + 27 * MINUTE)).toEqual([]);
    expect(tracker.check([extended], START + 56 * MINUTE)).toHaveLength(1);
  });
});
