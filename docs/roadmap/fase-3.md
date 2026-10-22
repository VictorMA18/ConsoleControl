# Fase 3 · Respaldo con Supabase (Sprint 4)

## Objetivo

Respaldo unidireccional dispositivo → nube de los registros pendientes (HU-008).

## Fechas

23/11–4/12/2026.

## Entregables

- Servicio de sincronización en `src/sync/`.
- Proyecto de Supabase con las tablas de respaldo (por definir).

## Tareas principales

- Subir los registros con `sync_status = 'pendiente'` y marcarlos `'sincronizado'`.
- Revisar el efecto del cambio de hora del celular en la sincronización.
- Tareas de Jira: por definir con el backlog.

## Criterio de salida

- Un registro creado sin internet aparece en Supabase tras recuperar la conexión y queda marcado `'sincronizado'`.
- Sin internet, la app sigue funcionando igual.
- No hay claves de Supabase en el repositorio.

## Riesgos

- Cambio de hora del dispositivo: puede afectar los registros al sincronizar.
- Ausencia de internet en el ciber: los pendientes se acumulan.
- El cliente pide login (Observación O1): afectaría cómo se identifica el respaldo.

## Depende de

[Fase 2](fase-2.md).
