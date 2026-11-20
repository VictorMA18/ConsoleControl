# HU-005: Cierre de sesión y liquidación

**Jira:** pendiente

**Como** administrador del ciber, **quiero** ver el resumen exacto de cobro al terminar una sesión, **para** cobrar el monto correcto en pocos segundos.

| Campo                     | Valor                               |
| ------------------------- | ----------------------------------- |
| Prioridad MoSCoW          | Must Have                           |
| Estimación                | 5 Story Points                      |
| Casos de uso / requisitos | CU-002, RF-05, RN-03, RN-04, RNF-01 |
| Dependencias técnicas     | HU-003                              |
| Interesados               | INT-01 Propietario / Administrador  |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Resumen de cobro

- DADO QUE una consola está "En Juego" o en "Tiempo Cumplido",
- CUANDO el administrador la pulsa para finalizar la sesión,
- ENTONCES el sistema muestra minutos jugados, mandos utilizados, penalidad (si hubo) y total en soles en menos de 100 ms.

### Escenario 2. Margen de cortesía

- DADO QUE el cliente excedió el tiempo contratado,
- CUANDO el exceso supera los 3 minutos de gracia,
- ENTONCES el sistema tarifa automáticamente la fracción de 15 minutos (RN-03).

## Notas técnicas

- `calculateSettlement` (`src/services/settlement.ts`) es una función pura que reutiliza el motor de HU-003 (`src/services/tariff.ts`): la gracia y las fracciones son las de allí, no se duplican.
- Los minutos jugados son `fin − started_at`, redondeados hacia arriba (ADR 0003). En tiempo libre no hay exceso: se cobra el tiempo real.
- Al finalizar, la sesión pasa a `por_cobrar` con su liquidación guardada (`played_minutes`, `charged_minutes`, `penalty_cents`, `total_cents`). La consola sigue ocupada hasta el cobro (HU-006). Ver [ADR 0013](../adr/0013-estados-de-sesion-y-cobro.md).
- Pantalla `app/cobro/[sessionId].tsx`, a la que se llega al tocar una consola ocupada del muro.
- **Cambio de regla de VN (19/11/2026).** En tiempo fijo se cobra el tiempo jugado: el precio por hora con sus mandos, proporcional a los minutos y redondeado hacia arriba a S/ 0.10. Vale aunque la sesión se corte antes o se pase de lo contratado. Hay una tolerancia de 5 minutos tras cumplirse lo contratado: dentro de ella se cobra solo lo contratado; pasada la tolerancia se cobran todos los minutos jugados y lo que se pasó se muestra como «Exceso», a la misma tarifa. La gracia de 3 minutos y los bloques de 15 (escenario 2) siguen aplicando solo al tiempo libre. Ver la regla 5 en [`../architecture/tarifario.md`](../architecture/tarifario.md).
