import { clockStore } from '../../src/hooks/useNow';

const START = new Date('2026-10-23T10:00:00.000Z').getTime();

beforeEach(() => {
  jest.useFakeTimers({ now: START });
});

afterEach(() => {
  jest.useRealTimers();
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
