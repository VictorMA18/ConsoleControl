# ADR 0004 · Drizzle ORM

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

El acceso a SQLite necesita consultas tipadas, un esquema único y migraciones versionadas para que RF y VM trabajen sin pisarse.

## Decisión

Usar Drizzle ORM sobre `expo-sqlite`, con esquema en `src/db/schema/` y migraciones generadas por `drizzle-kit` en `src/db/migrations/`.

## Alternativas descartadas

- SQL a mano: más código repetido y sin tipos.
- Kysely: menos integración con Expo.

## Consecuencias

- Las consultas viven solo en `src/db/`; ESLint bloquea importar `drizzle-orm` fuera de esa carpeta.
- Las migraciones se generan con `pnpm db:generate` y no se renombran ni se editan una vez fusionadas a `develop`.
