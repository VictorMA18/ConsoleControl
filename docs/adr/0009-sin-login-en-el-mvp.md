# ADR 0009 · Sin login en el MVP

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

El cliente es una persona mayor de edad que opera el ciber directamente. Hay un operador por dispositivo.

## Decisión

El MVP no tiene login, usuarios ni roles.

## Alternativas descartadas

- PIN local y Supabase Auth: se evalúan en una fase posterior. El login con Supabase exige internet.

## Consecuencias

- Observación O1: el cliente puede pedir login después. No se agregan columnas ni pantallas de usuario ahora, pero tampoco se acopla la lógica a un único usuario (por ejemplo, no se usan datos globales sueltos para identificar al operador).
- Si se agrega login, se registra un ADR nuevo.
