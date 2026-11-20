import { useCallback, useRef } from 'react';

// Ignora los toques repetidos durante un momento (por defecto 800 ms). Evita que un doble toque
// abra dos veces la misma pantalla mientras corre la transición, o repita una acción.
export function usePressOnce(windowMs = 800) {
  const last = useRef(0);
  return useCallback(
    <Args extends unknown[]>(action: (...args: Args) => void) =>
      (...args: Args) => {
        const now = Date.now();
        if (now - last.current < windowMs) {
          return;
        }
        last.current = now;
        action(...args);
      },
    [windowMs],
  );
}
