import { useSyncExternalStore } from 'react';

// Reloj compartido que avisa cada segundo mientras alguna pantalla lo usa (HU-002, TW-84).
// Un solo temporizador para todas las tarjetas: los cronómetros del muro cambian a la vez.
// Solo sirve para refrescar la pantalla; el tiempo se calcula con sessionTimer (ADR 0003).

type Listener = () => void;

const TICK_MS = 1000;
const listeners = new Set<Listener>();
let current = Date.now();
let timer: ReturnType<typeof setTimeout> | undefined;

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

export const clockStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    if (listeners.size === 1) {
      current = Date.now();
      scheduleTick();
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        stop();
      }
    };
  },
  getSnapshot(): number {
    return current;
  },
};

// Hora actual en milisegundos, actualizada cada segundo.
export function useNow(): number {
  return useSyncExternalStore(clockStore.subscribe, clockStore.getSnapshot);
}
