# HU-002: Cronómetro persistente en segundo plano

**Jira:** TW-36

**Como** administrador del ciber, **quiero** que el cronómetro de cada consola siga corriendo aunque minimice la app o se apague el teléfono, **para** no perder el control de los tiempos ante imprevistos.

| Campo | Valor |
|---|---|
| Prioridad MoSCoW | Must Have |
| Estimación | 8 Story Points (complejidad alta, incertidumbre técnica alta) |
| Casos de uso / requisitos | CU-001, RF-02, RNF-03, RNF-04 |
| Dependencias técnicas | HU-001; persistencia de la hora de inicio en SQLite |
| Interesados | INT-01 Propietario / Administrador |
| Boceto | Muro de consolas con cronómetros y código cromático (Anexo C) |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. App minimizada
- DADO QUE existe al menos una sesión activa,
- CUANDO el administrador minimiza la aplicación o la cierra y la vuelve a abrir,
- ENTONCES el tiempo transcurrido de cada sesión es exacto, sin reinicios ni pérdida de precisión.

### Escenario 2. Reinicio del teléfono
- DADO QUE existen sesiones activas,
- CUANDO el teléfono se apaga y se vuelve a encender,
- ENTONCES el sistema restaura las sesiones desde SQLite con el tiempo real transcurrido.

### Escenario 3. Código cromático
- DADO QUE el muro de consolas está visible,
- CUANDO el estado de una consola cambia,
- ENTONCES su tarjeta muestra verde (disponible), rojo (en juego) o ámbar (próxima a terminar o tiempo cumplido).

## Riesgo
Android puede cerrar servicios en segundo plano. Mitigación: persistir la hora de inicio en SQLite y recalcular el tiempo al reanudar (`ahora − started_at`), en lugar de depender solo de un contador activo. Se aborda primero.

## Tareas técnicas del Sprint 1
TW-10 (servicio de cronómetro persistente), TW-11 (visualización y código cromático).