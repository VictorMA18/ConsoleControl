# HU-008: Sincronización con la nube

**Jira:** pendiente

**Como** propietario del ciber, **quiero** que los datos se respalden en la nube cuando haya internet, **para** no perder la información si el teléfono se daña o se extravía.

| Campo                     | Valor                                 |
| ------------------------- | ------------------------------------- |
| Prioridad MoSCoW          | Must Have                             |
| Estimación                | 8 Story Points (partes a, b y c)      |
| Casos de uso / requisitos | CU-007, RF-13, RNF-04, RNF-08, RN-09  |
| Dependencias técnicas     | HU-001 a HU-007; proyecto de Supabase |
| Interesados               | INT-01 Propietario / Administrador    |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Sincronización exitosa

- DADO QUE existen registros locales pendientes y el teléfono recupera la conexión,
- CUANDO el monitor de conectividad lo detecta,
- ENTONCES el sistema envía los registros en orden cronológico y los marca "Sincronizado" al recibir la confirmación.

### Escenario 2. Conexión interrumpida

- DADO QUE la conexión se pierde durante el envío,
- CUANDO el sistema reintenta en el siguiente intervalo,
- ENTONCES no se duplican registros en la nube.

### Escenario 3. Operación sin internet

- DADO QUE no hay conexión a internet,
- CUANDO el administrador usa cualquier función de la aplicación,
- ENTONCES todas las funciones siguen operativas y sin retrasos (RN-09).

## Notas técnicas

### a. Motor (`src/sync/`)

- Respaldo en un solo sentido, del dispositivo a la nube ([ADR 0008](../adr/0008-supabase-respaldo-unidireccional.md)). SQLite es la fuente de verdad.
- `RemoteStore` es la interfaz del destino; `FakeRemoteStore`, una nube en memoria que puede simular un corte, para las pruebas.
- `runSync` recorre las tablas en orden de dependencia: consolas, mandos, tarifas, turnos, sesiones, extensiones, pagos y mantenimientos. Dentro de cada tabla envía en orden cronológico (`updated_at` y luego `created_at`) y por lotes de 50.
- Cada lote se marca sincronizado solo después de que la nube lo confirma. Ante un error se detiene y lo devuelve sin lanzarlo.
- El upsert es por `id` (UUID), así que reenviar no duplica. Los reintentos esperan 5 s, 15 s y luego 60 s (`retryDelayMs`).
- `markRecordsSynced` (`src/db/repositories/syncRepository.ts`) solo marca un registro si su `updated_at` sigue siendo el que se envió. Si cambió durante el envío, queda pendiente y se reenvía. Asigna `sync_status` de forma explícita, así `controlColumns` no lo vuelve a `pendiente`, y solo toca columnas de sincronización, lo que también vale para turnos cerrados (RN-05).
- Los registros viajan con los nombres de columna de SQLite (snake_case), que son los mismos de la nube.
