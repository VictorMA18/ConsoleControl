# HU-003: Tarificación escalonada por mandos

**Jira:** TW-37

**Como** administrador del ciber, **quiero** que el sistema calcule la tarifa según el tiempo y los mandos asignados, **para** cobrar de forma justa sin cálculos mentales.

| Campo | Valor |
|---|---|
| Prioridad MoSCoW | Must Have |
| Estimación | 3 Story Points (complejidad baja) |
| Casos de uso / requisitos | CU-001, RF-04, RN-01 |
| Dependencias técnicas | HU-001; tarifas base por tipo de consola cargadas por defecto |
| Interesados | INT-01 Propietario / Administrador, INT-04 Clientes / Jugadores |
| Boceto | Diálogo de configuración rápida con total estimado (Anexo C) |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Recargo por mando adicional
- DADO QUE una sesión tiene más de un mando asignado,
- CUANDO el sistema calcula la tarifa,
- ENTONCES suma el recargo por cada mando extra a partir del segundo jugador (RN-01).

### Escenario 2. Tiempo fijo
- DADO QUE se eligió una modalidad de tiempo fijo,
- CUANDO se calcula el monto,
- ENTONCES coincide con el tarifario vigente para ese tipo de consola.

## Tareas técnicas del Sprint 1
TW-12 (tarifas base y regla de recargo), TW-13 (motor de tarificación), TW-14 (total estimado en el diálogo).