# Acta de la Sprint Review del Sprint 1

| Campo      | Valor                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| Tarea      | T21 (TW-21) · TW-141 y TW-142                                              |
| Fecha      | 18/11/2026                                                                 |
| Modalidad  | Revisión con cliente simulado: VN asume el rol de propietario del ciber    |
| Incremento | APK 1.0.0, build de EAS 9ee60139, en el emulador `ConsoleControl_GamaBaja` |
| Guion      | [`sprint-review-guion.md`](sprint-review-guion.md)                         |
| Resultado  | **Incremento aceptado**                                                    |

## Demostración

| Historia | Qué se mostró                                                                                    | Evidencia                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-001   | Inicio de sesión en 2 toques; mandos insuficientes con alternativas; consola ocupada bloqueada   | [`CP-001`](evidencias/CP-001_2026-11-18.png), [`CP-002`](evidencias/CP-002_2026-11-18.png), [`CP-003`](evidencias/CP-003_2026-11-18.png)      |
| HU-002   | Cronómetro exacto tras minimizar, cerrar la app y reiniciar el teléfono; verde y rojo en el muro | [`CP-004`](evidencias/CP-004_2min_2026-11-18.png), [`CP-005`](evidencias/CP-005_2026-11-18.png), [`CP-012`](evidencias/CP-012_2026-11-18.png) |
| HU-003   | Total estimado en vivo según mandos y modalidad                                                  | [`CP-007`](evidencias/CP-007_2026-11-18.png), [`CP-008`](evidencias/CP-008_2026-11-18.png), [`CP-011`](evidencias/CP-011_2026-11-18.png)      |
| HU-004   | Ámbar titilante, vibración y aviso a 5 minutos; "Tiempo cumplido" fijo                           | [`CP-009`](evidencias/CP-009_2026-11-18.png), [`CP-010`](evidencias/CP-010_2026-11-18.png)                                                    |

## Retroalimentación

| Historia | Comentario                                                          | ¿Cambio pedido? | Prioridad                |
| -------- | ------------------------------------------------------------------- | --------------- | ------------------------ |
| HU-001   | Iniciar una sesión toma 2 toques, como se pidió                     | No              | —                        |
| HU-002   | El tiempo no se pierde al minimizar, cerrar ni reiniciar            | No              | —                        |
| HU-003   | El total coincide con el tarifario aprobado en T12                  | No              | —                        |
| HU-004   | La alerta se ve y se siente; con la app cerrada no avisa (ADR 0011) | No para el MVP  | Se evalúa en el Sprint 2 |

## Acuerdos

- HU-001 a HU-004 quedan aceptadas.
- La siguiente prioridad es cerrar y cobrar una sesión (HU-005), señalada en la evaluación de usabilidad (U-07).
- Los ajustes al backlog están en [`ajustes-backlog.md`](ajustes-backlog.md).
