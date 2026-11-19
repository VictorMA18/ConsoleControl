# HU-010: Cálculo de vuelto en efectivo

**Jira:** pendiente

**Como** administrador del ciber, **quiero** ver el vuelto exacto en números grandes y de alto contraste, **para** agilizar el cobro y evitar errores de devolución.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Por confirmar                      |
| Estimación                | 2 Story Points                     |
| Casos de uso / requisitos | CU-002, RF-08                      |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

- DADO QUE el método de pago elegido es efectivo,
- CUANDO el administrador digita el monto entregado por el cliente,
- ENTONCES el sistema muestra el vuelto exacto en alto contraste.

## Notas técnicas

- `calculateChange(totalCents, tenderedCents)` (`src/services/change.ts`) trabaja en céntimos y, si lo entregado no alcanza, devuelve el faltante en lugar de un vuelto negativo.
- Componente aislado `src/components/ChangeCalculator.tsx` con teclado numérico. Recibe solo la parte en efectivo del cobro: en pago mixto el vuelto se calcula únicamente sobre ella. Se conecta a la pantalla de cobro en HU-006.
