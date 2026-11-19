# HU-009: Extensión dinámica de tiempo

**Jira:** pendiente

**Como** administrador del ciber, **quiero** añadir bloques de 15 o 30 minutos a una sesión en curso, **para** que el cliente continúe jugando sin reiniciar cálculos.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Should Have                        |
| Estimación                | 3 Story Points                     |
| Casos de uso / requisitos | CU-001, RF-03                      |
| Dependencias técnicas     | HU-002, HU-003, HU-004             |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

- DADO QUE una sesión está activa,
- CUANDO el administrador pulsa la consola y añade un bloque de 15 o 30 minutos,
- ENTONCES el cronómetro continúa sin detenerse, el vencimiento se actualiza y el monto estimado se recalcula.

## Notas técnicas

- `planExtension` (`src/services/extension.ts`) es una función pura: valida el bloque (15 o 30), que la sesión esté activa, sea de tiempo fijo y no haya cumplido su tiempo. Devuelve la duración nueva, el vencimiento (`started_at + duración`, ADR 0003) y el monto recalculado con `calculateRate` sobre las tarifas guardadas en la sesión (RN-08).
- `extendSessionDuration` (`src/db/repositories/sessionRepository.ts`) actualiza `duration_ms` y `total_cents` y guarda la extensión en `session_extensions` (migración 0006) en una transacción. Solo aplica si la duración no cambió desde que se calculó, para no sumar dos veces con un doble toque.
- La liquidación de HU-005 ya usa `duration_ms`, así que al finalizar se cobra el tiempo contratado con la extensión, y el exceso se mide desde el vencimiento nuevo.
- El aviso de 5 minutos (`createAlertTracker`) olvida los avisos de una sesión cuando vuelve a estar «en curso», así que avisa de nuevo con el vencimiento nuevo sin duplicar.
- Interfaz: sección «Añadir tiempo» en `app/cobro/[sessionId].tsx` (`ExtendTime`), con el total nuevo en cada botón. No aparece en tiempo libre.
- Por confirmar con VN: con el tiempo ya cumplido no se extiende; se finaliza y se cobra el exceso.
