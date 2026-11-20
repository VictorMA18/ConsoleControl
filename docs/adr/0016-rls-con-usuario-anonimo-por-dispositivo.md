# ADR 0016 · RLS con un usuario anónimo por dispositivo

## Estado

Aceptada (decisión de VN, 19/11/2026)

## Fecha

19/11/2026

## Contexto

El respaldo en Supabase (HU-008) escribe desde la app. El MVP no tiene inicio de sesión ([ADR 0009](0009-sin-login-en-el-mvp.md)), así que la clave pública de Supabase viaja dentro del APK y cualquiera que la extraiga puede llamar a la API. Hace falta la política de seguridad por filas (RLS) más estricta posible sin una pantalla de login.

## Decisión

- Cada instalación inicia una **sesión anónima** en Supabase Auth (`signInAnonymously`), sin que la persona vea nada. La sesión se guarda en `expo-sqlite/kv-store`, así el dispositivo conserva su usuario entre reinicios.
- Cada tabla de la nube tiene `owner_id uuid` (por defecto `auth.uid()`) y su clave primaria es `(owner_id, id)`. Las consolas, mandos y tarifas iniciales tienen el mismo `id` en todos los dispositivos, y así no chocan.
- **RLS** activado en todas las tablas, con políticas para el rol `authenticated` (el de los usuarios anónimos):
  - `select`, `insert` y `update` solo si `(select auth.uid()) = owner_id`;
  - sin política de `delete`: el respaldo nunca borra.
- Se revocan todos los permisos de `anon` y `authenticated` (incluido `TRUNCATE`, que se salta RLS) y solo se conceden `select`, `insert` y `update` a `authenticated`.
- El esquema está en `supabase/schema.sql` y se aplicó al proyecto «ConsoleControl» (sa-east-1).

## Alternativas descartadas

- **Solo escritura por una función `security definer`:** nadie podría leer con la clave, pero quien la tenga podría sobrescribir cualquier fila, porque no hay dueño.
- **Tablas abiertas a `anon`:** cualquiera con la clave leería y cambiaría los datos del ciber.

## Consecuencias

- Quien extraiga la clave puede crear sus propios usuarios anónimos y escribir filas propias, pero **no puede leer ni modificar las del ciber**.
- Para frenar el abuso conviene activar CAPTCHA o límites de registro en Supabase Auth antes de publicar.
- Si se reinstala la app o se borran sus datos, el dispositivo obtiene un usuario nuevo y sus respaldos anteriores quedan con el usuario viejo. Pasar a un login real (fuera del MVP) permitiría unirlos.
- Hay que activar «Allow anonymous sign-ins» en Authentication › Sign In / Providers del proyecto.
