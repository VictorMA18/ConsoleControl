# Fase 0 · Sprint 1: núcleo de sesiones

## Objetivo

Dejar la base del proyecto y el núcleo de sesiones: arquitectura (T01), proyecto React Native con navegación (T02), esquema SQLite (T03), prototipo y validación (T04, T05), tablero Kanban (T06) y las historias HU-001 a HU-004 (iniciar sesión, cronómetro persistente, tarifas y alerta de tiempo cumplido), con pruebas, integración y Sprint Review (T17 a T21).

## Fechas

12–23/10/2026.

## Entregables

- Documentación base y convenciones (T01).
- Proyecto Expo con navegación y CI (T02).
- Esquema SQLite con migraciones (T03).
- Historias HU-001 a HU-004 funcionando sin internet.
- Pruebas, integración y Sprint Review (T17 a T21).

## Tareas principales

La tarea Tn es la clave de Jira TW-n.

| Tarea | Jira | Contenido | Depende de |
|---|---|---|---|
| T01 | TW-1 | Arquitectura offline-first y convenciones técnicas | Ninguna |
| T02 | TW-2 | Proyecto React Native con navegación | T01 |
| T03 | TW-3 | Esquema SQLite | T01 |
| T04 | TW-4 | Prototipo | Por definir |
| T05 | TW-5 | Validación | Por definir |
| T06 | TW-6 | Tablero Kanban | Por definir |
| T07 | TW-7 | Por definir | T02, T03 y T04 |
| T08 | TW-8 | Por definir | Por definir |
| T09 | TW-9 | Por definir | Por definir |
| T10 | TW-10 | Servicio de cronómetro persistente | T03 y T09 |
| T11 | TW-11 | Por definir | Por definir |
| T12 a T15 | TW-12 a TW-15 | Por definir | Por definir |
| T16 | TW-16 | Por definir | Por definir |
| T17 y T18 | TW-17, TW-18 | Pruebas e integración (por definir cuál es cuál) | Por definir |
| T19 | TW-19 | Por definir | T07 a T16 |
| T20 | TW-20 | Por definir | Por definir |
| T21 | TW-21 | Por definir | T19 y otras por definir |

Las columnas "Depende de" marcadas "Por definir" se copian del README del plan, que no consta en las instrucciones de T01.

**Ruta crítica:** T01 → T03 → T09 → T10 → T11 → T16 → T19 → T21.

## Criterio de salida

- Una sesión iniciada sigue con el tiempo correcto tras cerrar y reabrir la app.
- Una sesión sin internet se crea y cierra con `sync_status = 'pendiente'`.
- Las historias HU-001 a HU-004 cumplen sus criterios Given-When-Then.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan en `develop`.

## Riesgos

- Cambio de hora del dispositivo: altera el tiempo calculado (ver arquitectura, sección 4).
- Ausencia de internet en el ciber: la app debe funcionar igual.
- El cliente pide login (Observación O1): no se acopla la lógica a un único usuario.

## Depende de

Ninguna fase anterior.
