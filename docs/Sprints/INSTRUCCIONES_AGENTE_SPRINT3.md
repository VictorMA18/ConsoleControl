# Instrucciones para el agente de código: Sprint 3 (Sincronización, extensión de tiempo y mantenimiento)

**Para:** el agente de código del repositorio ConsoleControl Mobile.
**De:** VN (Victor Narciso Mamani Anahua, Product Owner, QA y arquitecto).
**Fecha de redacción:** miércoles 18/11/2026.
**Historias:** HU-008, HU-009, HU-012 y HU-014 (19 puntos).
**Objetivo del sprint:** respaldar los datos en la nube cuando haya internet sin afectar el uso sin conexión, poder extender el tiempo de una sesión en curso, ver la salud de cada consola y mando, y recibir alertas de mantenimiento preventivo.

El equipo va atrasado. **Esta sesión busca terminar el Sprint 3 lo más rápido posible sin romper lo que ya funciona.** Si algo no está claro o falta un dato, **pregunta a VN antes de inventarlo**.

---

## 1. Antes de escribir código

### 1.1 Lee, en este orden
1. `AGENTS.md` (y `CLAUDE.md`, que solo lo referencia).
2. `docs/README.md`, `docs/architecture/arquitectura.md` y los ADR de `docs/adr/`, **en especial** `0008-supabase-respaldo-unidireccional.md`.
3. `docs/guides/flujo-git.md`, `docs/guides/estilo-codigo.md` y `docs/guides/pruebas.md`.
4. `docs/specs/HU-001.md` a `HU-007.md`, para copiar su formato.
5. El código existente de `src/db/`, `src/services/`, `src/sync/` y `app/`.

### 1.2 Diagnóstico obligatorio (haz esto primero y repórtalo a VN)
Comprueba en `develop`:
- Qué historias del Sprint 1 y del Sprint 2 (HU-001 a HU-007, HU-010) ya están integradas.
- Que `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan.
- El esquema SQLite actual: tablas, migraciones, convención de nombres, y si ya existen `updated_at` y `sync_status` en todas las tablas.
- Si `src/sync/` tiene algo y qué dice el ADR 0008.

**Si falta alguna pieza de las historias anteriores que este sprint necesita, no la implementes por tu cuenta.** Dile a VN qué falta y espera su decisión. Lo independiente, adelántalo.

### 1.3 Crea las fichas en `docs/specs/`
Guarda `HU-008.md`, `HU-009.md`, `HU-012.md` y `HU-014.md` con el contenido de la sección 4 (Given-When-Then **sin cambiar**), con el mismo formato de `HU-001.md`.

---

## 2. Reglas de trabajo

- Código en inglés; interfaz, documentos y mensajes de commit en español, según `AGENTS.md`. **Para las tablas y columnas de SQLite, sigue la convención que ya exista en `src/db/`**; si agregas tablas, usa el mismo estilo de nombres.
- Capas: Interfaz → Lógica → Acceso a datos → SQLite. Ningún SQL fuera de `src/db/`. La sincronización vive en `src/sync/`.
- Zod para validar entradas, React Hook Form en formularios, Zustand para estado de interfaz, TanStack Query para datos. No agregues otras librerías sin avisar (las dos excepciones previstas están en HU-008).
- **Dinero** en céntimos enteros, igual que en el Sprint 2.
- Todo cambio de esquema va en una **migración nueva**, nunca editando una existente.
- Una rama por historia: `feature/HU-008-sincronizacion`, `feature/HU-009-extension-tiempo`, `feature/HU-012-semaforo-salud`, `feature/HU-014-alerta-mantenimiento`. Commits `tipo(HU-008): descripción`.
- Un PR por historia hacia `develop`. **No hagas merge ni apruebes tus propios PR.**
- **No toques Jira.** VN crea y mueve las tareas. Al final, dile qué historias quedaron listas para revisión.
- No inventes reglas de negocio, umbrales ni valores. Lo desconocido se escribe `Por confirmar` y se avisa a VN.
- Las pantallas nuevas deben verse y comportarse como las ya hechas (mismos componentes y colores). No hay bocetos de estas pantallas; no inventes flujos adicionales a los criterios.

---

## 3. Orden de trabajo y dependencias

```
HU-009 (extensión)  ──────────────┐   independientes: se pueden hacer ya,
HU-012 (semáforo)  ──► HU-014 ────┤   incluso mientras se termina el Sprint 2
                                  ▼
                       HU-008 (sincronización)  ← al final: necesita todas las tablas
```

1. **HU-009** y **HU-012** primero y en paralelo. Solo dependen de HU-001 a HU-004 y del inventario.
2. **HU-014** después de HU-012 (usa las horas de uso) y de que el Sprint 2 registre sesiones cobradas.
3. **HU-008 al final**, porque debe sincronizar las tablas de todas las historias anteriores. Si el Sprint 2 aún no está en `develop`, construye el motor de sincronización genérico y agrega las tablas de pagos y turnos cuando existan.

Si trabajas con varias sesiones en paralelo, usa un `git worktree` por historia y mantén las migraciones en orden (no dos con el mismo número).

---

## 4. Las historias

### HU-009 · Extensión dinámica de tiempo (3 puntos)

**Como** administrador del ciber, **quiero** añadir bloques de 15 o 30 minutos a una sesión en curso, **para** que el cliente continúe jugando sin reiniciar cálculos.
Casos de uso y reglas: CU-001, RF-03.

**Criterio de aceptación**
- DADO QUE una sesión está activa,
- CUANDO el administrador pulsa la consola y añade un bloque de 15 o 30 minutos,
- ENTONCES el cronómetro continúa sin detenerse, el vencimiento se actualiza y el monto estimado se recalcula.

**Trabajo técnico**
- *Datos:* aumentar la duración contratada de la sesión y registrar cada extensión (tabla `extensiones` con sesión, minutos y fecha, más los campos de sincronización) para tener historial.
- *Lógica:* función `extendSession(session, minutes)` que valide que `minutes` sea 15 o 30 y que la sesión sea de **tiempo fijo y esté "En Juego"**. El vencimiento nuevo es `started_at + duración contratada` (calculado, no un contador). Recalcula el monto estimado con el motor de tarificación de HU-003.
- *Alerta:* si la sesión ya tenía programado el aviso de 5 minutos (HU-004), reprográmalo con el vencimiento nuevo, sin duplicar avisos. Si estaba en "Tiempo cumplido", no extiendas: ese caso es por confirmar.
- *Interfaz:* en la consola en juego, acción "Añadir tiempo" con las opciones de 15 y 30 minutos. El cronómetro no se reinicia ni parpadea.

**Por confirmar con VN**
- Si se puede extender una sesión que ya está en "Tiempo cumplido". Por defecto, **no**.
- Para "tiempo libre" la acción no aplica; no la muestres.

**Pruebas (solo lógica, 3 pruebas)**
1. Añadir 15 minutos: el vencimiento se mueve 15 minutos y el monto se recalcula.
2. Añadir 30 minutos: igual con 30.
3. Un bloque que no sea 15 o 30, o una sesión en tiempo libre: se rechaza.

**Checklist manual (VN, 4 comprobaciones)**
- [ ] Añadir 15 minutos a una sesión en juego: el cronómetro sigue sin reiniciarse.
- [ ] El vencimiento y el total estimado cambian.
- [ ] El aviso de 5 minutos llega con el vencimiento nuevo, no con el viejo.
- [ ] En una sesión de tiempo libre no aparece la opción.

**Hecho cuando:** la extensión funciona sin reiniciar el cronómetro y las 3 pruebas pasan.

---

### HU-012 · Semáforo de salud de mandos y consolas (5 puntos)

**Como** propietario del ciber, **quiero** ver el estado de cada consola y mando (operativo, en mantenimiento o defectuoso) y las horas de uso acumuladas, **para** prevenir averías antes de que ocurran.
Casos de uso y reglas: CU-004, RF-10, RN-06.

**Criterio de aceptación**
- DADO QUE el equipo está registrado en el inventario,
- CUANDO el propietario reporta una falla o un mantenimiento,
- ENTONCES el estado se actualiza en el semáforo y el equipo marcado en mantenimiento o defectuoso queda excluido de la asignación (RN-06).

**Trabajo técnico**
- *Datos:* agregar a consolas y mandos un estado (`operativo`, `mantenimiento`, `defectuoso`) y las **horas de uso acumuladas** (guárdalas como minutos enteros). Si ya existe un estado parecido, extiéndelo en lugar de duplicarlo.
- *Horas de uso:* se acumulan **al cobrar una sesión** (HU-006), con los minutos jugados de la liquidación de HU-005. Si el Sprint 2 aún no está integrado, deja la función `addUsage(consoleId, minutes)` lista y sin llamar, y repórtalo.
- *Exclusión (RN-06):* las validaciones de inicio de sesión de HU-001 deben **excluir** consolas y mandos que no estén `operativo`. Esto toca código de HU-001: haz el cambio mínimo, con su prueba, y avísalo en el PR.
- *Interfaz:* pantalla o sección "Salud del equipo" con el semáforo (verde operativo, ámbar mantenimiento, rojo defectuoso), las horas de uso y la acción de reportar falla o mantenimiento y de volver a operativo. Si una consola tiene una sesión activa, no permitas marcarla en mantenimiento sin avisar.

**Pruebas (solo lógica, 4 pruebas)**
1. Un equipo en mantenimiento o defectuoso queda excluido de la asignación.
2. Un equipo operativo sigue disponible.
3. `addUsage` suma los minutos a las horas acumuladas.
4. Cambiar el estado de un equipo con sesión activa se rechaza o se advierte, según lo definido.

**Checklist manual (VN, 5 comprobaciones)**
- [ ] El semáforo muestra el color correcto por equipo.
- [ ] Reportar una falla en un mando lo saca de la asignación al iniciar una sesión.
- [ ] Una consola en mantenimiento no se puede iniciar.
- [ ] Volver a "operativo" la devuelve a la asignación.
- [ ] Las horas de uso suben después de cobrar una sesión.

**Hecho cuando:** el estado excluye equipos de la asignación, las horas se acumulan y las 4 pruebas pasan.

---

### HU-014 · Alerta de mantenimiento preventivo (3 puntos)

**Como** propietario del ciber, **quiero** recibir una alerta cuando una consola alcance un umbral de horas de uso, **para** programar limpieza o cambio de pasta térmica antes de que falle.
Dependencias técnicas: HU-012. Casos de uso y reglas: CU-004, RF-11.

**Criterio de aceptación**
- DADO QUE una consola acumula horas de uso con cada sesión cobrada,
- CUANDO alcanza el umbral configurado (por ejemplo, 150 h para limpieza o 500 h para pasta térmica),
- ENTONCES el sistema muestra una alerta de mantenimiento y reinicia el contador al registrarse la intervención.

**Trabajo técnico**
- *Datos:* tabla de mantenimientos (consola, tipo `limpieza` o `pasta_termica`, fecha y horas de uso acumuladas en ese momento, más los campos de sincronización).
- *Contador:* **no borres ni pongas a cero las horas de uso.** Las horas desde la última intervención se calculan como `horas acumuladas − horas registradas en la última intervención de ese tipo`. Así "reiniciar el contador" no pierde historial.
- *Lógica:* función pura `getMaintenanceAlerts(consoles, maintenances, thresholds)` que devuelva qué consolas pasaron cada umbral. Los umbrales (150 h limpieza, 500 h pasta térmica) van como constantes con nombre; HU-013 los hará configurables en el Sprint 4.
- *Interfaz:* alerta visible en el muro de consolas o en la sección de salud del equipo, y acción "Registrar mantenimiento" (limpieza o pasta térmica) que guarda la intervención y hace desaparecer la alerta.

**Pruebas (solo lógica, 3 pruebas)**
1. Una consola bajo el umbral: sin alerta.
2. Una consola que alcanza 150 h desde la última limpieza: alerta de limpieza.
3. Después de registrar la limpieza, las horas desde la última intervención vuelven a cero y la alerta desaparece, sin perder las horas acumuladas.

**Checklist manual (VN, 4 comprobaciones)**
- [ ] Una consola con horas por debajo del umbral no muestra alerta.
- [ ] Al pasar el umbral aparece la alerta.
- [ ] Registrar el mantenimiento la quita.
- [ ] Las horas totales de la consola siguen intactas.

**Hecho cuando:** la alerta aparece al alcanzar el umbral, se limpia al registrar la intervención sin perder historial y las 3 pruebas pasan.

---

### HU-008 · Sincronización asíncrona con Supabase (8 puntos)

**Como** propietario del ciber, **quiero** que los datos se respalden en la nube cuando haya internet, **para** no perder la información si el teléfono se daña o se extravía.
Dependencias técnicas: HU-001 a HU-007 (datos a sincronizar); proyecto Supabase configurado. Casos de uso y reglas: CU-007, RF-13, RNF-04, RNF-08, RN-09.

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

**Estado del proyecto Supabase: todavía no existe.** No lo crees tú ni uses credenciales que no te hayan dado. Construye todo contra una interfaz y un cliente simulado, y deja listo lo que VN necesita para conectarlo después (ver 4.1).

#### 4.1 Diseño (respeta el ADR 0008: unidireccional, dispositivo → nube)

- **El dispositivo manda.** No hay descarga de datos desde la nube ni resolución de conflictos. SQLite sigue siendo la fuente de verdad.
- Estructura de `src/sync/`:
  - `remoteStore.ts`: **interfaz** con lo que el motor necesita de la nube (por ejemplo, `upsertRecords(table, records)`), sin nada de Supabase adentro.
  - `supabaseRemoteStore.ts`: implementación real con `@supabase/supabase-js`.
  - `fakeRemoteStore.ts`: implementación en memoria para pruebas y para trabajar mientras no exista el proyecto, con opción de simular un corte de conexión.
  - `syncEngine.ts`: toma los registros con `sync_status = pendiente`, **en orden cronológico** (por `updated_at`/`created_at`), los envía por lotes, y marca `sincronizado` **solo después de recibir la confirmación**.
  - `connectivity.ts`: monitor de conectividad con `@react-native-community/netinfo` (o `expo-network` si el proyecto ya lo usa). Dispara la sincronización al recuperar conexión, al volver la app a primer plano y cada cierto intervalo.
- **Sin duplicados:** el envío es un **upsert por el UUID** del registro (`id`). Reintentar el mismo registro lo sobrescribe, no lo duplica. Si un registro se modifica localmente después de enviarse, vuelve a `pendiente`.
- **Reintentos:** con espera creciente (por ejemplo 5 s, 15 s, 60 s, con tope). Si falla un lote, los registros quedan `pendiente` y no se pierde nada.
- **Nunca bloquea la interfaz (RN-09):** la sincronización corre aparte, con `try/catch` en todo; un error de red no puede lanzar excepciones hacia las pantallas ni retrasar ninguna función. Sin internet, el motor simplemente espera.
- **Qué se sincroniza:** todas las tablas con `sync_status` (sesiones, pagos, turnos, extensiones, mantenimientos, estado de equipos, etc.). Si alguna tabla no tiene `sync_status`, agrégalo en una migración.
- **Cierre de turno (RN-05):** los registros de un turno cerrado son de solo lectura, **pero `sync_status` y `updated_at` deben poder cambiar** para poder marcar esos registros como sincronizados. Verifica que el Sprint 2 lo permite; si no, repórtalo.
- **Indicador en la interfaz:** estado visible "Offline / Pendiente (N registros)" y "Nube actualizada", alimentado desde un store de Zustand. No hay boceto; hazlo simple (un texto o icono pequeño en la cabecera).
- **Seguridad:** la URL y la clave pública de Supabase van en variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) en un archivo `.env` **que no se sube al repositorio**. Agrega `.env.example` con los nombres y sin valores. Nunca escribas una clave en el código ni en un documento.

**Entregables para que VN conecte Supabase después**
- `supabase/schema.sql`: SQL con las tablas espejo (mismos nombres y columnas que SQLite, `id` UUID como clave primaria, `updated_at`), listo para pegar en el editor SQL de Supabase.
- `docs/guides/supabase.md`: pasos para crear el proyecto, ejecutar `schema.sql`, copiar la URL y la clave pública al `.env` y probar la conexión.
- **Seguridad de las tablas:** como el MVP no tiene login (observación O1), la clave pública escribiría directamente. Escribe en `docs/guides/supabase.md` una advertencia clara de este riesgo y propón la política de seguridad por filas (RLS) más estricta que sea posible sin login. **No decidas por tu cuenta**: pregúntale a VN y registra la decisión en un ADR.

**Trabajo técnico, en orden**
1. Interfaz `RemoteStore` y `fakeRemoteStore`.
2. `syncEngine` con lotes, orden cronológico, marcado tras confirmación y reintentos.
3. `connectivity` y disparadores.
4. Store de estado e indicador en la interfaz.
5. `supabaseRemoteStore`, sin probarlo contra un proyecto real.
6. `schema.sql`, `docs/guides/supabase.md`, `.env.example` y el ADR de seguridad.

**Pruebas (solo lógica, máximo 6 pruebas, todas contra `fakeRemoteStore`)**
1. Con registros pendientes y conexión, se envían y quedan `sincronizado`.
2. El orden de envío es cronológico.
3. Si el envío falla a mitad, los no confirmados siguen `pendiente`.
4. Reintentar tras un fallo no duplica registros en la nube (upsert por `id`).
5. Un registro modificado después de sincronizarse vuelve a `pendiente`.
6. Sin conexión, el motor no lanza errores y no marca nada como sincronizado.

**Checklist manual (VN, 6 comprobaciones; las que usan la nube real solo cuando exista el proyecto)**
- [ ] Sin internet (modo avión), iniciar, extender y cobrar una sesión funciona igual que siempre y sin demora.
- [ ] El indicador muestra "Pendiente" con el número de registros.
- [ ] Al volver el internet, el indicador pasa a "Nube actualizada". *(necesita Supabase real)*
- [ ] En Supabase aparecen los registros, sin duplicados. *(necesita Supabase real)*
- [ ] Cortar el internet a mitad del envío y reconectar no duplica registros. *(necesita Supabase real)*
- [ ] Un turno cerrado sigue sin poder editarse, pero sus registros se sincronizan.

**Hecho cuando:** el motor funciona contra el cliente simulado, el modo sin internet no se ve afectado, existen `schema.sql`, la guía y `.env.example`, y las 6 pruebas pasan. Las comprobaciones con la nube real quedan pendientes hasta que VN cree el proyecto.

---

## 5. Política de pruebas de este sprint (simple, para no perder tiempo)

- **Automáticas:** solo las que pide cada historia, sobre lógica pura. **Total: unas 16 pruebas.** Sin pruebas de interfaz, sin snapshots, sin pruebas de extremo a extremo y sin llamadas a internet (todo contra `fakeRemoteStore`).
- **Manuales:** el checklist corto de cada historia, que ejecuta VN en un celular **una sola vez, al final del sprint**, más una pasada de humo del flujo completo en un equipo de gama baja. Nada de rondas por historia.
- **Puerta para pasar a revisión:** `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde, más una revisión rápida de otro integrante. El checklist manual lo hace VN después.
- Guarda los checklists en `docs/qa/checklist-HU-008.md`, `HU-009`, `HU-012` y `HU-014`, con las casillas vacías.
- Si una prueba falla porque el código está mal, arréglalo en tu historia. Nunca cambies una aserción ni uses `skip` para que pase.
- El cambio en las validaciones de HU-001 (RN-06) lleva su propia prueba y se avisa en el PR de HU-012. No toques más código de otras historias.

---

## 6. Verificación antes de entregar

- [ ] Existen las fichas `docs/specs/HU-008.md`, `HU-009.md`, `HU-012.md` y `HU-014.md`, con los Given-When-Then sin cambios.
- [ ] Las migraciones son nuevas y ordenadas. Toda tabla tiene `id` UUID, `created_at`, `updated_at` y `sync_status`.
- [ ] No hay SQL fuera de `src/db/` y la sincronización está solo en `src/sync/`.
- [ ] La sincronización nunca bloquea la interfaz ni lanza errores hacia las pantallas.
- [ ] El envío usa upsert por `id` y marca `sincronizado` solo tras la confirmación.
- [ ] No hay claves ni URL de Supabase en el código ni en ningún documento; solo `.env.example`, y `.env` está en `.gitignore`.
- [ ] No se creó ningún proyecto de Supabase ni se usaron credenciales no entregadas.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan; la salida real está en el informe.
- [ ] Un PR por historia hacia `develop`, sin merge.
- [ ] Lo desconocido está marcado `Por confirmar`.

---

## 7. Informe final (respóndele a VN con esto)

1. Diagnóstico de 1.2: qué había en `develop` y qué faltaba.
2. Qué PR abriste (rama y enlace) y qué contiene cada uno.
3. Salida real de lint, tipos y pruebas.
4. Decisiones por defecto que VN debe confirmar (extender en "Tiempo cumplido", umbrales, política de seguridad de Supabase).
5. Qué necesita VN para conectar Supabase (pasos de `docs/guides/supabase.md`).
6. Qué historias quedan listas para el checklist manual y cuáles no, con el motivo.

## 8. Límites

- No cambies la pila tecnológica ni la estructura de `AGENTS.md`.
- No hagas merge, no apruebes PR, no cierres tareas, no toques Jira.
- No crees recursos en la nube ni uses credenciales que no te hayan dado.
- No implementes sincronización en dos sentidos ni resolución de conflictos (ADR 0008).
- No implementes HU-013 (parametrización) ni HU-011 (fiados completos): son del Sprint 4. Los umbrales van como constantes con nombre.
