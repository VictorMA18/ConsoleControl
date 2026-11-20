# HU-012: Semáforo de salud de mandos y consolas

**Jira:** pendiente

**Como** propietario del ciber, **quiero** ver el estado de cada consola y mando (operativo, en mantenimiento o defectuoso) y las horas de uso acumuladas, **para** prevenir averías antes de que ocurran.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Should Have                        |
| Estimación                | 5 Story Points                     |
| Casos de uso / requisitos | CU-004, RF-10, RN-06               |
| Dependencias técnicas     | HU-001, HU-005, HU-006             |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

- DADO QUE el equipo está registrado en el inventario,
- CUANDO el propietario reporta una falla o un mantenimiento,
- ENTONCES el estado se actualiza en el semáforo y el equipo marcado en mantenimiento o defectuoso queda excluido de la asignación (RN-06).

## Notas técnicas

- **Estados:** las consolas suman `averiado` y los mandos `mantenimiento` (`src/db/schema/enums.ts`). `averiado` hace de «defectuoso». El semáforo es verde para operativo (también en juego o en uso), ámbar para mantenimiento y rojo para averiado.
- **Horas de uso:** `usage_minutes` en consolas y mandos (migración 0007). `registerPayments` suma los minutos jugados de la liquidación a la consola y a los mandos prestados, dentro de la transacción del cobro (`addUsageMinutes`, `src/db/usage.ts`).
- **Exclusión (RN-06):** `openSession` y `countOperationalControllers` ya aceptaban solo consolas `disponible` y mandos `operativo`, así que el código de HU-001 no cambia. Solo se agregó el mensaje «está averiada».
- **Cambios de estado (`setConsoleStatus` y `setControllerStatus`):** no tocan una consola en juego ni un mando en uso. La interfaz lo explica y no lo permite hasta cerrar la sesión.
- **Interfaz:** pestaña Salud (`app/(tabs)/salud.tsx`) con el conteo por color, una tarjeta por consola con su estado, sus horas y sus mandos, y un selector Operativa/Mantenimiento/Averiada. Sacar una consola de servicio pide confirmación. En el muro, una consola averiada se ve como «Averiada» y atenuada.
- Por confirmar con VN: usar `averiado` en lugar de un estado nuevo `defectuoso`.
