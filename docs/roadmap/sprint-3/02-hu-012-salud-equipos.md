# Parte 02 · HU-012 Semáforo de salud de mandos y consolas (5 puntos)

Rama: `feature/HU-012-semaforo-salud`, sobre la rama de la parte 01. Ficha: `docs/specs/hu-012-semaforo-salud.md`.

**Como** propietario del ciber, **quiero** ver el estado de cada consola y mando (operativo, en mantenimiento o defectuoso) y las horas de uso acumuladas, **para** prevenir averías antes de que ocurran.
Casos de uso y reglas: CU-004, RF-10, RN-06.

## Criterios de aceptación (Given-When-Then)

- DADO QUE el equipo está registrado en el inventario,
- CUANDO el propietario reporta una falla o un mantenimiento,
- ENTONCES el estado se actualiza en el semáforo y el equipo marcado en mantenimiento o defectuoso queda excluido de la asignación (RN-06).

## Trabajo

- **Datos (migración nueva):** ya existen estados: consolas `disponible`, `en_juego`, `mantenimiento`; mandos `operativo`, `en_uso`, `averiado`. **Extiende, no dupliques:** `averiado` hace de "defectuoso"; añádelo a las consolas. Agrega a consolas y mandos las **horas de uso acumuladas** como minutos enteros (`usage_minutes`).
- **Horas de uso:** `addUsage(consoleId, minutes)` en la capa de datos. Se llama **al cobrar** una sesión (HU-006), dentro de la misma transacción, con los minutos jugados de la liquidación de HU-005.
- **Exclusión (RN-06):** las validaciones de inicio de sesión (`startSession`, `src/services/sessionService.ts`, y `countOperationalControllers`) deben excluir consolas y mandos que no estén operativos. Cambio mínimo en código de HU-001, con su prueba, y avisarlo en la PR.
- **Interfaz:** pantalla `app/salud/` con el semáforo (verde operativo, ámbar mantenimiento, rojo averiado), las horas de uso y las acciones "reportar falla", "poner en mantenimiento" y "volver a operativo". Si la consola tiene sesión activa, no se permite marcarla sin avisar.

## Por confirmar con VN

- Usar `averiado` en lugar de un estado nuevo `defectuoso`.

## Pruebas (lógica pura, `__tests__/services/health.test.ts`)

1. Un equipo en mantenimiento o averiado queda excluido de la asignación; uno operativo sigue disponible.
2. `addUsage` suma los minutos a las horas acumuladas (extraer la suma como función pura).

## Hecho cuando

El estado excluye equipos de la asignación, las horas se acumulan al cobrar y las 2 pruebas están escritas. Lint y typecheck en verde.
