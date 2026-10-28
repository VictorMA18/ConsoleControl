import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

// Reloj compartido que avisa cada segundo mientras alguna pantalla lo usa (HU-002, TW-84).
// Un solo temporizador para todas las tarjetas: los cronómetros del muro cambian a la vez.
// Solo sirve para refrescar la pantalla; el tiempo se calcula con sessionTimer (ADR 0003).
//
// En segundo plano se detiene para no gastar batería, y al volver a primer plano avisa de
// inmediato con la hora actual, así el cronómetro salta al valor correcto sin esperar (TW-85).

type Listener = () => void;

const TICK_MS = 1000;
const listeners = new Set<Listener>();
let current = Date.now();
let timer: ReturnType<typeof setTimeout> | undefined;
let appStateSubscription: NativeEventSubscription | undefined;

function notify() {
  current = Date.now();
  listeners.forEach((listener) => listener());
}

// Se alinea con el cambio de segundo del reloj para que el cronómetro no salte ni se atrase.
function scheduleTick() {
  timer = setTimeout(
    () => {
      notify();
      scheduleTick();
    },
    TICK_MS - (Date.now() % TICK_MS),
  );
}

function stop() {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
}

function onAppStateChange(state: AppStateStatus) {
  stop();
  if (state === 'active') {
    notify();
    scheduleTick();
  }
}

export const clockStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    if (listeners.size === 1) {
      current = Date.now();
      scheduleTick();
      appStateSubscription = AppState.addEventListener('change', onAppStateChange);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        stop();
        appStateSubscription?.remove();
        appStateSubscription = undefined;
      }
    };
  },
  getSnapshot(): number {
    return current;
  },
};

// Hora actual en milisegundos, actualizada cada segundo y al volver del segundo plano.
export function useNow(): number {
  return useSyncExternalStore(clockStore.subscribe, clockStore.getSnapshot);
}
