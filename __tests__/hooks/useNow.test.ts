import { AppState, type AppStateStatus } from 'react-native';

import { clockStore } from '../../src/hooks/useNow';

const START = new Date('2026-10-23T10:00:00.000Z').getTime();

let changeAppState: (state: AppStateStatus) => void;
const removeAppStateListener = jest.fn();

beforeEach(() => {
  jest.useFakeTimers({ now: START });
  removeAppStateListener.mockClear();
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, handler) => {
      changeAppState = handler as (state: AppStateStatus) => void;
      return { remove: removeAppStateListener };
    })
    // jest-expo ya simula AppState: se limpian las llamadas de otras pruebas.
    .mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('reloj compartido', () => {
  it('avisa cada segundo con la hora actual', () => {
    const listener = jest.fn();
    const unsubscribe = clockStore.subscribe(listener);

    jest.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(clockStore.getSnapshot()).toBe(START + 1000);

    jest.advanceTimersByTime(3000);
    expect(listener).toHaveBeenCalledTimes(4);
    expect(clockStore.getSnapshot()).toBe(START + 4000);

    unsubscribe();
  });

  it('se alinea con el cambio de segundo', () => {
    jest.setSystemTime(START + 300);
    const listener = jest.fn();
    const unsubscribe = clockStore.subscribe(listener);

    jest.advanceTimersByTime(699);
    expect(listener).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(clockStore.getSnapshot()).toBe(START + 1000);

    unsubscribe();
  });

  it('usa un solo temporizador para varias pantallas', () => {
    const first = jest.fn();
    const second = jest.fn();
    const unsubscribeFirst = clockStore.subscribe(first);
    const unsubscribeSecond = clockStore.subscribe(second);

    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(1000);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    unsubscribeSecond();
  });

  it('se detiene cuando ninguna pantalla lo usa', () => {
    const listener = jest.fn();
    const unsubscribe = clockStore.subscribe(listener);
    unsubscribe();

    expect(jest.getTimerCount()).toBe(0);
    jest.advanceTimersByTime(5000);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('reloj compartido · segundo plano', () => {
  it('no avisa mientras la app está en segundo plano', () => {
    const listener = jest.fn();
    const unsubscribe = clockStore.subscribe(listener);

    changeAppState('background');
    expect(jest.getTimerCount()).toBe(0);
    jest.advanceTimersByTime(5 * 60 * 1000);
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('al volver a primer plano avisa de inmediato con la hora real y sigue cada segundo', () => {
    const listener = jest.fn();
    const unsubscribe = clockStore.subscribe(listener);

    changeAppState('background');
    // El celular pasa 5 minutos con la app minimizada.
    jest.setSystemTime(START + 5 * 60 * 1000);
    changeAppState('active');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(clockStore.getSnapshot()).toBe(START + 5 * 60 * 1000);

    jest.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(clockStore.getSnapshot()).toBe(START + 5 * 60 * 1000 + 1000);

    unsubscribe();
  });

  it('deja de escuchar el estado de la app cuando ninguna pantalla lo usa', () => {
    const unsubscribe = clockStore.subscribe(jest.fn());
    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(removeAppStateListener).toHaveBeenCalledTimes(1);
  });
});
