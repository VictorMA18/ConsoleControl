# Parte 04 · HU-008a Motor de sincronización (de 8 puntos de HU-008)

Rama: `feature/HU-008-motor-sync`, sobre la rama de la parte 03. Ficha de la historia completa: `docs/specs/hu-008-sincronizacion.md` (se crea aquí).

**Como** propietario del ciber, **quiero** que los datos se respalden en la nube cuando haya internet, **para** no perder la información si el teléfono se daña o se extravía.
Dependencias técnicas: HU-001 a HU-007 (datos a sincronizar); proyecto Supabase configurado. Casos de uso y reglas: CU-007, RF-13, RNF-04, RNF-08, RN-09.

## Criterios de aceptación (Given-When-Then)

**Escenario 1. Sincronización exitosa**

- DADO QUE existen registros locales pendientes y el teléfono recupera la conexión,
- CUANDO el monitor de conectividad lo detecta,
- ENTONCES el sistema envía los registros en orden cronológico y los marca "Sincronizado" al recibir la confirmación.

**Escenario 2. Conexión interrumpida**

- DADO QUE la conexión se pierde durante el envío,
- CUANDO el sistema reintenta en el siguiente intervalo,
- ENTONCES no se duplican registros en la nube.

**Escenario 3. Operación sin internet**

- DADO QUE no hay conexión a internet,
- CUANDO el administrador usa cualquier función de la aplicación,
- ENTONCES todas las funciones siguen operativas y sin retrasos (RN-09).

## Diseño (respeta el [ADR 0008](../../adr/0008-supabase-respaldo-unidireccional.md))

- **Unidireccional, dispositivo → nube.** SQLite es la fuente de verdad; no hay descarga ni resolución de conflictos.
- El proyecto de Supabase **todavía no existe**: todo se construye contra una interfaz y un cliente simulado.

## Trabajo (esta parte)

1. `src/sync/remoteStore.ts`: interfaz `RemoteStore` (por ejemplo `upsertRecords(table, records)`), sin nada de Supabase adentro.
2. `src/sync/fakeRemoteStore.ts`: implementación en memoria, con opción de simular un corte de conexión.
3. `src/sync/syncEngine.ts`: toma los registros con `sync_status = pendiente` **en orden cronológico** (`updated_at`/`created_at`), los envía por lotes y marca `sincronizado` **solo tras la confirmación**. Upsert por `id` (UUID): reintentar no duplica. Reintentos con espera creciente (5 s, 15 s, 60 s, con tope). Todo con `try/catch`: un error de red nunca llega a las pantallas.
4. Acceso a datos: consulta de pendientes por tabla y función que marca `sincronizado` **sin** reiniciar `sync_status` a `pendiente` (hoy `controlColumns` lo reinicia en cada update). Debe funcionar también con turnos cerrados (RN-05).
5. Tablas a sincronizar: todas las que tengan `sync_status` (sesiones, pagos, turnos, extensiones, mantenimientos, consolas, mandos, tarifas).

## Pruebas (lógica pura, contra `fakeRemoteStore`, `__tests__/sync/syncEngine.test.ts`)

1. Con pendientes y conexión se envían en orden cronológico y quedan `sincronizado`.
2. Si el envío falla a mitad, los no confirmados siguen `pendiente` y reintentar no duplica (upsert por `id`).
3. Sin conexión el motor no lanza errores y no marca nada como sincronizado.

El motor debe poder probarse sin SQLite: recibe una función que lista pendientes y otra que marca sincronizado.

## Hecho cuando

El motor funciona contra el cliente simulado y las 3 pruebas están escritas. Lint y typecheck en verde.
