# ADR 0008 · Respaldo unidireccional con Supabase

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

Se quiere una copia de los datos en la nube (HU-008) sin que la operación dependa de internet.

## Decisión

Respaldar solo en el sentido dispositivo → nube. `src/sync/` sube los registros con `sync_status = 'pendiente'` y los marca `'sincronizado'`. El dispositivo manda y no hay resolución de conflictos.

## Alternativas descartadas

- Sincronización en dos sentidos: exige resolver conflictos, demasiado para el MVP.

## Consecuencias

- No se implementa sincronización en dos sentidos.
- La sincronización se hace en la Fase 3, no en el Sprint 1.
- Las claves de Supabase no se suben al repositorio.
