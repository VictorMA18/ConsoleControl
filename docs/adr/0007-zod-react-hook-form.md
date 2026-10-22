# ADR 0007 · Zod con React Hook Form

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

Los datos deben validarse al capturarlos en un formulario y de nuevo antes de escribir en SQLite, sin duplicar reglas.

## Decisión

Definir un esquema Zod por entidad en `src/schemas/` y usarlo en React Hook Form (con `@hookform/resolvers/zod`) y en los servicios.

## Alternativas descartadas

- Zod con estado propio de formulario: más código para errores y estados de campo.

## Consecuencias

- Un solo esquema para formulario y datos.
- RF y VM acuerdan los esquemas, porque `src/schemas/` es compartido.
