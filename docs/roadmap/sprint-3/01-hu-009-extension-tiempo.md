# Parte 01 · HU-009 Extensión dinámica de tiempo (3 puntos)

Rama: `feature/HU-009-extension-tiempo`, desde `develop`. Ficha: `docs/specs/hu-009-extension-tiempo.md`.

**Como** administrador del ciber, **quiero** añadir bloques de 15 o 30 minutos a una sesión en curso, **para** que el cliente continúe jugando sin reiniciar cálculos.
Casos de uso y reglas: CU-001, RF-03.

## Criterios de aceptación (Given-When-Then)

- DADO QUE una sesión está activa,
- CUANDO el administrador pulsa la consola y añade un bloque de 15 o 30 minutos,
- ENTONCES el cronómetro continúa sin detenerse, el vencimiento se actualiza y el monto estimado se recalcula.

## Trabajo

- **Datos (migración nueva):** aumentar `duration_ms` de la sesión y registrar cada extensión en la tabla `session_extensions` (sesión, minutos) para tener historial.
- **Lógica:** `extendSession(session, minutes)` valida que `minutes` sea 15 o 30 y que la sesión sea de **tiempo fijo y esté en juego**. El vencimiento nuevo es `started_at + duración contratada`, calculado. Recalcula el monto con el motor de HU-003 (`src/services/tariff.ts`, `sessionQuote.ts`).
- **Alerta:** el aviso de 5 minutos (`createAlertTracker`, `src/services/sessionAlerts.ts`) debe usar el vencimiento nuevo sin duplicar avisos: al extender, olvida el aviso ya emitido de esa sesión.
- **Interfaz:** en la pantalla `app/cobro/[sessionId].tsx` mientras la sesión sigue activa, acción "Añadir tiempo" con 15 y 30 minutos. El cronómetro no se reinicia ni parpadea. En tiempo libre no se muestra.

## Por confirmar con VN

- Extender una sesión en "Tiempo cumplido": por defecto, **no**.

## Pruebas (lógica pura, `__tests__/services/extendSession.test.ts`)

1. Añadir 15 o 30 minutos: el vencimiento se mueve ese tiempo y el monto se recalcula.
2. Un bloque que no sea 15 o 30, o una sesión en tiempo libre: se rechaza.

## Hecho cuando

La extensión funciona sin reiniciar el cronómetro y las 2 pruebas están escritas. Lint y typecheck en verde.
