# ADR 0002 · SQLite como fuente de verdad

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

El ciber puede quedarse sin internet y la operación diaria (iniciar y cerrar sesiones, cobrar) no puede detenerse.

## Decisión

Guardar todos los datos de negocio en SQLite en el dispositivo, con `expo-sqlite`. El dispositivo es la fuente de verdad; la nube es solo respaldo.

## Alternativas descartadas

- Supabase como fuente de verdad: el ciber puede quedarse sin internet.

## Consecuencias

- Toda función de negocio funciona sin conexión.
- Cada registro lleva `sync_status` para el respaldo posterior (ver [ADR 0008](0008-supabase-respaldo-unidireccional.md)).
- Una pérdida del dispositivo sin respaldo implica pérdida de datos.
