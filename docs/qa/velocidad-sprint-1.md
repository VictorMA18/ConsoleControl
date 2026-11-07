# Velocidad real del Sprint 1

| Campo          | Valor                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| Tarea          | T21 (TW-21) · TW-144                                                             |
| Estado de Jira | Leído el 06/11/2026                                                              |
| Estado         | **Pendiente de cerrar:** VN debe confirmar el estado de Jira al cerrar el sprint |

## Datos de Jira

| Dato                                      | Valor                                           |
| ----------------------------------------- | ----------------------------------------------- |
| Tareas planificadas                       | 21                                              |
| Horas planificadas (suma de estimaciones) | 136 h                                           |
| Story Points planificados                 | 19 (HU-001: 5, HU-002: 8, HU-003: 3, HU-004: 3) |
| Tareas en "Listo"                         | 7 (TW-1, 2, 3, 9, 10, 13, 15)                   |
| Historias en "Listo"                      | 0 de 4 (TW-35 a TW-38 en "Por hacer")           |

| Estado      | Tareas                     | Horas estimadas |
| ----------- | -------------------------- | --------------- |
| Listo       | 7                          | 44 h            |
| En revisión | 4 (TW-4, 5, 12, 19)        | 30 h            |
| En curso    | 6 (TW-6, 7, 8, 11, 16, 20) | 42 h            |
| Por hacer   | 4 (TW-14, 17, 18, 21)      | 20 h            |

## Cálculos del agente

| Métrica            | Cálculo  | Resultado |
| ------------------ | -------- | --------- |
| Horas completadas  | 44 / 136 | 32.4 %    |
| Tareas completadas | 7 / 21   | 33.3 %    |
| Puntos completados | 0 / 19   | 0 %       |
| Horas pendientes   | 136 − 44 | 92 h      |

Los puntos son 0 por la regla "historia terminada = todas sus tareas y criterios aprobados". Las horas son estimadas, no registradas: una tarea cuenta solo si está en "Listo".

## Capacidad del siguiente sprint

Es una estimación del agente, no un compromiso.

| Dato                                            | Cálculo          | Resultado       |
| ----------------------------------------------- | ---------------- | --------------- |
| Semanas transcurridas                           | 12/10 al 06/11   | 4 semanas       |
| Ritmo observado                                 | 44 h / 4 semanas | 11 h por semana |
| Capacidad de un sprint de 2 semanas a ese ritmo | 11 × 2           | 22 h            |
| Sprints para las 92 h pendientes a ese ritmo    | 92 / 22          | Unos 4 sprints  |

22 h es un mínimo prudente: no cuenta las 72 h de tareas en curso o en revisión, que ya tienen avance. Una cifra más precisa exige saber cuánto falta de esas tareas: Por confirmar.

Al ritmo observado, lo pendiente del Sprint 1 no entra con holgura antes del MVP, sin contar el resto del backlog. Conviene revisarlo en la Planning.
