# Parte 06 · HU-008c Supabase y entregables (de 8 puntos de HU-008)

Rama: `feature/HU-008-supabase`, sobre la rama de la parte 05. No crees ningún proyecto de Supabase ni uses credenciales que no te hayan dado.

## Trabajo

1. `src/sync/supabaseRemoteStore.ts`: implementación real de `RemoteStore` con `@supabase/supabase-js` (ya está en el stack). Sin probarla contra un proyecto real.
2. Variables de entorno `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en un `.env` **fuera del repositorio** (agregarlo a `.gitignore`) y `.env.example` solo con los nombres. Nunca una clave en el código ni en un documento.
3. `supabase/schema.sql`: tablas espejo (mismos nombres y columnas que SQLite, `id` UUID como clave primaria, `updated_at`), listas para pegar en el editor SQL de Supabase.
4. `docs/guides/supabase.md`: pasos para crear el proyecto, ejecutar `schema.sql`, copiar URL y clave pública al `.env` y probar la conexión. Con una **advertencia clara**: como el MVP no tiene login (O1), la clave pública escribiría directamente; propón la política de seguridad por filas (RLS) más estricta posible sin login.
5. **Pregunta a VN** cuál política elegir y regístrala en un ADR (0016). No la decidas por tu cuenta.

## Hecho cuando

Existen `supabaseRemoteStore`, `schema.sql`, la guía, `.env.example` y el ADR de seguridad, y no hay claves en el repositorio. Lint y typecheck en verde. Las comprobaciones con la nube real quedan pendientes hasta que VN cree el proyecto.
