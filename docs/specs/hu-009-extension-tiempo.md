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

- `planExtension` (`src/services/extension.ts`) es una función pura: valida el bloque (30 min, 1 h o 2 h, las mismas duraciones que al iniciar), que la sesión esté activa y que sea de tiempo fijo. Se puede extender también con el tiempo ya cumplido: sumar tiempo cubre el exceso. Devuelve la duración nueva, el vencimiento (`started_at + duración`, ADR 0003) y el monto recalculado con `calculateRate` sobre las tarifas guardadas en la sesión (RN-08).
- `extendSessionDuration` (`src/db/repositories/sessionRepository.ts`) actualiza `duration_ms` y `total_cents` y guarda la extensión en `session_extensions` (migración 0006) en una transacción. Solo aplica si la duración no cambió desde que se calculó, para no sumar dos veces con un doble toque. La migración 0010 cambió el `CHECK` a `IN (15, 30, 60, 120)`; 15 queda solo por las extensiones registradas antes.
- La liquidación de HU-005 ya usa `duration_ms`, así que al finalizar se cobra el tiempo contratado con la extensión, y el exceso se mide desde el vencimiento nuevo.
- El aviso de 5 minutos (`createAlertTracker`) olvida los avisos de una sesión cuando vuelve a estar «en curso», así que avisa de nuevo con el vencimiento nuevo sin duplicar.
- Interfaz: sección «Añadir tiempo» en `app/cobro/[sessionId].tsx` (`ExtendTime`) con «+30 min», «+1 h» y «+2 h», cada uno con el total nuevo; con el tiempo cumplido indica si aún corre la tolerancia o ya se cobra el exceso. No aparece en tiempo libre.
- Decidido con VN (19/11/2026): se puede extender en «Por terminar» y con el tiempo cumplido; las opciones son 30 min, 1 h y 2 h.
