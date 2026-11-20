# ADR 0005 · Zustand y TanStack Query

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

La interfaz maneja dos tipos de estado: el de pantalla (filtros, selección) y los datos guardados en SQLite, que cambian tras cada escritura.

## Decisión

Usar Zustand solo para estado de interfaz y TanStack Query para leer y escribir datos de SQLite y para la sincronización.

## Alternativas descartadas

- Solo Zustand: obliga a recargar a mano los datos tras cada escritura.
- Solo contexto de React: más código y re-renderizados innecesarios.

## Consecuencias

- Los datos de negocio no se guardan en Zustand.
- Las lecturas y escrituras desde la interfaz pasan por hooks de TanStack Query en `src/hooks/`.
