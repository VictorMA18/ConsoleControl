# ADR 0010 · expo-crypto para generar UUID

## Estado

Propuesta

## Fecha

22/10/2026

## Contexto

Todas las tablas usan UUID de texto como clave primaria para crear registros sin conexión y subirlos a Supabase sin choques ([modelo de datos](../architecture/base-de-datos.md), decisión M1). React Native con Hermes no trae `crypto.randomUUID()`, así que hace falta una librería para generarlos al crear sesiones.

## Decisión

Usar `randomUUID()` de `expo-crypto`, solo dentro de `src/db/`.

## Alternativas descartadas

- Generador propio con `Math.random()`: no es aleatorio de calidad criptográfica y aumenta el riesgo de choques al sincronizar varios dispositivos.
- Librería `uuid`: necesita además un polyfill de `crypto.getRandomValues` en React Native.
- Id numérico autoincremental: dos dispositivos generarían el mismo id y chocarían en Supabase.

## Consecuencias

- Se agrega `expo-crypto`, que es parte del SDK de Expo y se instala con `pnpm exec expo install`.
- Los repositorios generan el id; la interfaz y los servicios no lo hacen.
