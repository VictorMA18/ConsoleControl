# Fase 2 · Sprint 3: sincronización, extensión de tiempo y mantenimiento

## Objetivo

Respaldar los datos en la nube sin afectar el uso sin conexión, extender el tiempo de una sesión, ver la salud de consolas y mandos y recibir alertas de mantenimiento.

## Fechas

9–20/11/2026.

## Entregables

HU-009, HU-012, HU-014 y HU-008 (19 puntos). Partes, orden y avance en [`sprint-3/README.md`](sprint-3/README.md).

## Criterio de salida

- Cada historia cumple sus criterios Given-When-Then; el motor de sincronización funciona contra el cliente simulado y sin internet la app no se ve afectada.
- No hay claves de Supabase en el repositorio.
- `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan en `develop`. Las comprobaciones con la nube real esperan a que VN cree el proyecto de Supabase.

## Riesgos

- Cambio de hora del dispositivo: puede afectar los registros al sincronizar.
- Clave pública de Supabase sin login (O1): requiere decidir la política de seguridad por filas (ADR).
- Ausencia de internet en el ciber: los pendientes se acumulan.

## Depende de

[Fase 1](fase-1.md).
