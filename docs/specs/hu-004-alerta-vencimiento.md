# HU-004: Alerta preventiva de vencimiento

**Jira:** TW-38

**Como** administrador del ciber, **quiero** recibir una alerta visual y una vibración antes de que venza una sesión, **para** evitar regalar minutos sin cobrar.

| Campo | Valor |
|---|---|
| Prioridad MoSCoW | Must Have |
| Estimación | 3 Story Points (complejidad baja) |
| Casos de uso / requisitos | CU-001, RN-02 |
| Dependencias técnicas | HU-002 |
| Interesados | INT-01 Propietario / Administrador |
| Boceto | Tarjeta de consola en ámbar titilante (Anexo C) |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Aviso previo
- DADO QUE una sesión de tiempo fijo está en curso,
- CUANDO faltan 5 minutos para su vencimiento,
- ENTONCES la tarjeta de la consola pasa a ámbar titilante y el teléfono vibra (RN-02).

### Escenario 2. Tiempo cumplido
- DADO QUE el tiempo de la sesión se agotó,
- CUANDO el administrador aún no la finaliza,
- ENTONCES la consola queda en "Tiempo Cumplido" hasta su liquidación.

## Nota de planificación
Si el Sprint 1 se retrasa, esta historia es la primera en pasar al Sprint 2.

## Tareas técnicas del Sprint 1
TW-15 (servicio de alerta y estado "Tiempo cumplido"), TW-16 (ámbar titilante y vibración).