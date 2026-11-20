# Retrospectiva del Sprint 1

| Campo         | Valor                                                                |
| ------------- | -------------------------------------------------------------------- |
| Tarea         | T21 (TW-21) · TW-143                                                 |
| Fecha         | 18/11/2026                                                           |
| Elaborada por | VN (jefe de proyecto), con los datos de Jira, GitHub y QA del sprint |

## Tablero

| Qué salió bien                                                                                | Qué mejorar                                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| La lógica de negocio (T09, T10, T13, T15) llegó con pruebas y CI en verde desde el primer PR  | El sprint de 2 semanas se cerró el 18/11, casi 4 semanas después de lo planificado (23/10)   |
| El riesgo técnico principal (cronómetro persistente) se resolvió temprano con el spike de T10 | La interfaz (T07, T08, T11, T14, T16) empezó tarde y bloqueó T18, T19, T20 y T21             |
| Las decisiones quedaron registradas (11 ADR, tarifario, guía de estilo)                       | Los PR #5 a #15 se fusionaron sin aprobación de otra persona y `develop` no tiene protección |
| Los casos de prueba se escribieron antes de la interfaz y guiaron su implementación           | Las historias TW-35 a TW-38 no tenían responsable en Jira                                    |
| El flujo completo se probó en un emulador de gama baja y cumple los 2 toques                  | 136 h para 2 semanas fue más de lo que el equipo pudo sostener                               |

## Acuerdos

| Acuerdo                                                                           | Responsable    | Fecha      |
| --------------------------------------------------------------------------------- | -------------- | ---------- |
| Activar la protección de `develop` y `main`: CI obligatorio y 1 aprobación        | VN             | 23/11/2026 |
| Asignar un responsable a cada historia y tarea en la Sprint Planning              | VN             | 23/11/2026 |
| Empezar la interfaz de cada historia en paralelo con su lógica, no después        | RF y VM        | Sprint 2   |
| Respetar el límite de 6 tareas "En curso" y revisarlo en cada daily               | Todo el equipo | Sprint 2   |
| Planificar con la capacidad medida en `velocidad-sprint-1.md`, no con la estimada | VN             | 23/11/2026 |
