# Respaldo en Supabase

Guía de HU-008. La app funciona igual sin esto: solo deja de respaldar en la nube.

## Proyecto actual

| Campo   | Valor                                      |
| ------- | ------------------------------------------ |
| Nombre  | ConsoleControl                             |
| Ref     | `mexzliopgyheggngugrg`                     |
| Región  | sa-east-1 (São Paulo)                      |
| URL     | `https://mexzliopgyheggngugrg.supabase.co` |
| Esquema | `supabase/schema.sql`, ya aplicado         |

## Pasos (para un proyecto nuevo o para otro integrante)

1. Crea el proyecto en [supabase.com](https://supabase.com) o con el MCP o la CLI de Supabase.
2. Ejecuta `supabase/schema.sql` en el editor SQL. Se puede ejecutar más de una vez.
3. En **Authentication › Sign In / Providers**, activa **Allow anonymous sign-ins** ([ADR 0016](../adr/0016-rls-con-usuario-anonimo-por-dispositivo.md)).
4. En **Project Settings › API Keys**, copia la URL y la clave publicable (`sb_publishable_…`).
5. Copia `.env.example` como `.env` en la raíz y completa:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   `.env` está en `.gitignore`: **nunca lo subas** ni pegues la clave en el código o en un documento.
6. Reinicia con `pnpm start --clear`, para que Expo lea las variables.

## Comprobar la conexión

- El indicador del muro pasa de «Sin nube» a «Subiendo…» y después a «Nube al día».
- En el panel de Supabase, **Table Editor › consoles** muestra las consolas con el `owner_id` del dispositivo.
- En modo avión el indicador dice «Sin conexión» y la app sigue funcionando igual. Al volver la red, sube lo pendiente.

## Advertencia de seguridad

El MVP no tiene login, así que la clave publicable va dentro del APK. Con RLS por usuario anónimo, quien la extraiga puede crear sus propias filas, pero **no puede leer ni cambiar las del ciber**. Antes de publicar la app, activa CAPTCHA o límites de registro en Supabase Auth para frenar el abuso.

## Cambios de esquema

Cuando una migración de SQLite agrega una tabla o una columna, hay que agregarla también en `supabase/schema.sql` y en el proyecto. Si no, el envío de esa tabla falla y queda pendiente hasta corregirlo. Las tablas se envían en el orden de `SYNC_TABLES` (`src/sync/types.ts`).
