# Parte 02 · HU-010 Cálculo de vuelto en efectivo (2 puntos)

Rama: `feature/HU-010-vuelto`, sobre la rama de la parte 01. Ficha: `docs/specs/hu-010-vuelto.md`.

**Como** administrador del ciber, **quiero** ver el vuelto exacto en números grandes y de alto contraste, **para** agilizar el cobro y evitar errores de devolución.
Casos de uso y reglas: CU-002, RF-08.

## Criterios de aceptación (Given-When-Then)

- DADO QUE el método de pago elegido es efectivo,
- CUANDO el administrador digita el monto entregado por el cliente,
- ENTONCES el sistema muestra el vuelto exacto en alto contraste.

## Trabajo

- **Lógica:** función pura `calculateChange(total, tendered)` en céntimos (`src/services/`). Si lo entregado es menor al total, devuelve el faltante, no un vuelto negativo.
- **Interfaz:** componente aislado `src/components/ChangeCalculator.tsx`, sin lógica de datos, que se conectará a la pantalla de cobro en la parte 03. Teclado numérico, vuelto en números grandes y alto contraste (tokens de `tailwind.config.js`). Si el pago es mixto, el vuelto se calcula solo sobre la parte en efectivo.

## Pruebas (lógica pura, `__tests__/services/change.test.ts`)

1. Entrega mayor o igual al total: vuelto exacto (cero si es igual).
2. Entrega menor al total: faltante, no vuelto negativo.

## Hecho cuando

El componente existe, `calculateChange` está probada (escrita) y lint y typecheck pasan. Se integra a la pantalla de cobro en la parte 03.
