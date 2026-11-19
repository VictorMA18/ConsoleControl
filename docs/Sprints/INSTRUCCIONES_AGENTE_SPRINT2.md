# Instrucciones para el agente de código: Sprint 2 (Cobro, caja y arqueo)

**Para:** el agente de código del repositorio ConsoleControl Mobile.
**De:** VN (Victor Narciso Mamani Anahua, Product Owner, QA y arquitecto).
**Fecha de redacción:** miércoles 18/11/2026.
**Historias:** HU-005, HU-006, HU-007 y HU-010 (20 puntos).
**Objetivo del sprint:** que el administrador cierre una sesión, vea el resumen exacto de cobro, registre el pago (efectivo, Yape, Plin o fiado, incluso mixto), calcule el vuelto y cierre el turno comparando el efectivo contado contra lo registrado.

El equipo va atrasado. **Esta sesión busca terminar el Sprint 2 lo más rápido posible sin romper lo que ya funciona.** Si algo no está claro o falta un dato, **pregunta a VN antes de inventarlo**.

---

## 1. Antes de escribir código

### 1.1 Lee, en este orden
1. `AGENTS.md` (y `CLAUDE.md`, que solo lo referencia).
2. `docs/README.md`, `docs/architecture/arquitectura.md` y los ADR de `docs/adr/`.
3. `docs/guides/flujo-git.md`, `docs/guides/estilo-codigo.md` y `docs/guides/pruebas.md`.
4. `docs/specs/HU-001.md` a `HU-004.md`, para copiar su formato.
5. El código existente de `src/db/`, `src/services/` y `app/`, para respetar nombres, capas y estilo.

### 1.2 Diagnóstico obligatorio (haz esto primero y repórtalo a VN)
El Sprint 2 se apoya en HU-001 a HU-004. Comprueba en `develop`:
- Que existen el muro de consolas, el diálogo de sesión, el cronómetro persistente, la tarificación (HU-003) y el estado "Tiempo cumplido" (HU-004).
- Que `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan en `develop`.
- Qué esquema SQLite existe hoy (tablas y migraciones) y qué convención de nombres usa.

**Si falta alguna pieza de HU-001 a HU-004 que este sprint necesita, no la implementes por tu cuenta.** Dile a VN qué falta y espera su decisión. Lo que sea independiente de esa pieza, adelántalo.

### 1.3 Crea las fichas en `docs/specs/`
Guarda `HU-005.md`, `HU-006.md`, `HU-007.md` y `HU-010.md` con el contenido de la sección 4 de este archivo (Given-When-Then **sin cambiar**), con el mismo formato de `HU-001.md`.

---

## 2. Reglas de trabajo

- Código en inglés; interfaz, documentos y mensajes de commit en español, según `AGENTS.md`. **Para las tablas y columnas de SQLite, sigue la convención que ya exista en `src/db/` (T03)**; si agregas tablas, usa el mismo estilo de nombres que las existentes.
- Capas: Interfaz → Lógica → Acceso a datos → SQLite. Ningún SQL fuera de `src/db/`.
- Zod para validar entradas, React Hook Form en formularios, Zustand para estado de interfaz, TanStack Query para datos. No agregues otras librerías sin avisar.
- **Dinero:** guarda y calcula los montos como **enteros en céntimos** (nunca `number` decimal). Si el proyecto ya tiene otra convención, sigue esa. Si no hay ninguna, usa céntimos y regístralo en un ADR (`docs/adr/`).
- Todo lo que cambie el esquema va en una **migración nueva**, nunca editando una existente. Cada tabla nueva lleva `id` (UUID), `created_at`, `updated_at` y `sync_status` (`pendiente` o `sincronizado`), para que HU-008 pueda sincronizarla después.
- Todo funciona **sin internet**. No llames a ningún servicio remoto en este sprint.
- Una rama por historia: `feature/HU-005-liquidacion`, `feature/HU-006-cobro`, `feature/HU-007-arqueo`, `feature/HU-010-vuelto`. Commits con el formato `tipo(HU-005): descripción`.
- Un PR por historia hacia `develop`. **No hagas merge ni apruebes tus propios PR.**
- **No toques Jira.** VN crea y mueve las tareas. Al final, dile qué historias quedaron listas para revisión.
- No inventes reglas de negocio, tarifas ni montos. Lo que no esté en este archivo ni en `docs/specs/` se escribe como `Por confirmar` y se avisa a VN.
- Las pantallas nuevas deben verse y comportarse como las del muro de consolas ya hecho (mismos componentes y colores). Los bocetos de estas pantallas no están disponibles; no inventes flujos adicionales a los de los criterios.

---

## 3. Orden de trabajo y dependencias

```
HU-005 (liquidación) ──► HU-006 (cobro) ──► HU-007 (arqueo)
                    └──► HU-010 (vuelto) ──┘   (HU-010 se integra en la pantalla de HU-006)
```

1. **HU-005** primero. Todo lo demás depende de ella.
2. **HU-010** se puede hacer en paralelo con HU-005: es una función pura y un componente aislado. Se conecta a la pantalla de cobro cuando exista HU-006.
3. **HU-006** después de HU-005.
4. **HU-007** al final, porque necesita cobros registrados.

Si trabajas con varias sesiones en paralelo, usa un `git worktree` por historia y mantén las migraciones en orden (no dos migraciones con el mismo número).

---

## 4. Las historias

### HU-005 · Cierre de sesión y liquidación (5 puntos)

**Como** administrador del ciber, **quiero** ver el resumen exacto de cobro al terminar una sesión, **para** cobrar el monto correcto en pocos segundos.
Dependencias técnicas: HU-003. Casos de uso y reglas: CU-002, RF-05, RN-03, RN-04, RNF-01.

**Escenario 1. Resumen de cobro**
- DADO QUE una consola está "En Juego" o en "Tiempo Cumplido",
- CUANDO el administrador la pulsa para finalizar la sesión,
- ENTONCES el sistema muestra minutos jugados, mandos utilizados, penalidad (si hubo) y total en soles en menos de 100 ms.

**Escenario 2. Margen de cortesía**
- DADO QUE el cliente excedió el tiempo contratado,
- CUANDO el exceso supera los 3 minutos de gracia,
- ENTONCES el sistema tarifa automáticamente la fracción de 15 minutos (RN-03).

**Trabajo técnico**
- *Datos:* guardar `ended_at` y el estado "Por cobrar" (o el estado equivalente que ya use el proyecto) al finalizar; guardar el resultado de la liquidación (minutos jugados, minutos de exceso, penalidad y total, en céntimos) para que el cobro y el arqueo lean el mismo número.
- *Lógica:* una función pura `calculateSettlement` que reciba la sesión (hora de inicio, hora de fin, duración contratada, modalidad, cantidad de mandos), el tarifario y la hora actual, y devuelva el desglose. Los minutos jugados se calculan como `fin − started_at`, nunca con un contador en memoria. Reutiliza el motor de tarificación de HU-003 para el monto base y el recargo por mando.
- *Interfaz:* pantalla de resumen de cobro con minutos jugados, mandos, penalidad y total en números grandes. Debe aparecer sin demora visible (meta: menos de 100 ms; la liquidación se calcula en memoria, sin consultas lentas).

**Por confirmar con VN (no inventes la regla)**
- Cómo se cobra exactamente la penalidad después de los 3 minutos de gracia (RN-03). Implementación por defecto, mientras no se confirme: pasada la gracia, el exceso se cobra **por fracciones de 15 minutos, redondeando hacia arriba**, con el precio de la fracción derivado de la tarifa por hora. Deja la gracia (3) y la fracción (15) como constantes de configuración con nombre, no como números sueltos, porque HU-013 las hará configurables.
- Para "tiempo libre" no hay exceso: se cobra por el tiempo real jugado.

**Pruebas (solo lógica, máximo 5 pruebas en `calculateSettlement`)**
1. Sin exceso: el total es el monto base.
2. Exceso de hasta 3 minutos: sin penalidad.
3. Exceso de más de 3 minutos: cobra la fracción de 15 minutos.
4. Con mandos adicionales: suma el recargo de HU-003.
5. Tiempo libre: cobra el tiempo real.
Usa tarifas definidas dentro de la propia prueba (no las del seed), así las cuentas no dependen de datos que cambien.

**Checklist manual (VN, 5 comprobaciones)**
- [ ] Finalizar una sesión "En Juego" muestra minutos, mandos y total.
- [ ] Finalizar una sesión en "Tiempo Cumplido" muestra el exceso.
- [ ] Un exceso de 2 minutos no cobra penalidad.
- [ ] Un exceso de 4 minutos cobra la fracción.
- [ ] Cerrar la app con la sesión por cobrar y reabrir conserva el resumen.

**Hecho cuando:** la liquidación se calcula desde SQLite, el resumen aparece y las 5 pruebas pasan.

---

### HU-006 · Registro multimodal de cobro (5 puntos)

**Como** administrador del ciber, **quiero** registrar el pago como efectivo, Yape, Plin o fiado, incluso en forma mixta, **para** separar el dinero físico del digital y evitar descuadres.
Dependencias técnicas: HU-005. Casos de uso y reglas: CU-002, RF-06, RN-04.

**Escenario 1. Cobro simple**
- DADO QUE se muestra el resumen de cobro,
- CUANDO el administrador elige un método de pago y pulsa "Cobrar y Liberar",
- ENTONCES el sistema registra el ingreso discriminado por método, actualiza la caja del día y deja la consola en "Disponible".

**Escenario 2. Pago mixto**
- DADO QUE el cliente paga una parte en efectivo y otra por Yape,
- CUANDO el administrador desglosa los dos montos,
- ENTONCES el sistema acepta el pago solo si la suma iguala el total.

**Escenario 3. Restricción de liberación**
- DADO QUE el pago no ha sido clasificado,
- CUANDO el administrador intenta liberar la consola,
- ENTONCES el sistema lo impide (RN-04).

**Trabajo técnico**
- *Datos:* tabla de pagos con una fila por método utilizado: sesión, método (`efectivo`, `yape`, `plin`, `fiado`), monto en céntimos, y los campos de sincronización. Una sesión con pago mixto tiene varias filas. Al cobrar, en **una sola transacción**: guardar los pagos, marcar la sesión como cobrada, devolver los mandos al inventario y dejar la consola "Disponible". Si algo falla, no queda nada a medias.
- *Lógica:* validar con Zod que la suma de los montos sea exactamente el total de la liquidación de HU-005, que no haya montos negativos o cero, y que haya al menos un método. Si la suma no coincide, rechazar con un mensaje claro.
- *Interfaz:* selector de método de pago (uno o varios), campos de monto por método con el resto precargado, y el botón "Cobrar y Liberar" **deshabilitado** mientras el pago no esté clasificado y completo.
- *Caja del día:* los cobros quedan leíbles por día y por método (HU-007 los usa).

**Por confirmar con VN**
- **Fiado:** la gestión completa de deudas es HU-011 (Sprint 4). Aquí `fiado` solo se registra como método de pago, con un campo opcional de nombre o apodo del cliente. No implementes saldos, abonos ni límite de crédito.

**Pruebas (solo lógica, máximo 5 pruebas en la validación de pagos)**
1. Un solo método con el monto exacto: acepta.
2. Pago mixto (efectivo + Yape) que suma el total: acepta.
3. Pago mixto que no suma el total: rechaza.
4. Sin método elegido: rechaza (RN-04).
5. Montos negativos o cero: rechaza.

**Checklist manual (VN, 6 comprobaciones)**
- [ ] Cobrar con efectivo deja la consola "Disponible" y devuelve los mandos al stock.
- [ ] Cobrar con Yape o Plin hace lo mismo y queda separado del efectivo.
- [ ] Pago mixto con la suma correcta funciona.
- [ ] Pago mixto con la suma incorrecta no deja cobrar.
- [ ] El botón "Cobrar y Liberar" está bloqueado sin método.
- [ ] Cerrar la app a mitad del cobro no deja la consola en un estado raro.

**Hecho cuando:** el cobro es atómico, la consola se libera solo con el pago clasificado y las 5 pruebas pasan.

---

### HU-010 · Cálculo de vuelto en efectivo (2 puntos)

**Como** administrador del ciber, **quiero** ver el vuelto exacto en números grandes y de alto contraste, **para** agilizar el cobro y evitar errores de devolución.
Casos de uso y reglas: CU-002, RF-08.

**Criterio de aceptación**
- DADO QUE el método de pago elegido es efectivo,
- CUANDO el administrador digita el monto entregado por el cliente,
- ENTONCES el sistema muestra el vuelto exacto en alto contraste.

**Trabajo técnico**
- *Lógica:* función pura `calculateChange(total, tendered)` en céntimos. Si lo entregado es menor al total, devuelve el faltante en lugar de un vuelto negativo.
- *Interfaz:* componente aislado que se integra en la pantalla de cobro de HU-006 cuando el método incluye efectivo. Teclado numérico, vuelto en números grandes y de alto contraste. Si el pago es mixto, el vuelto se calcula solo sobre la parte en efectivo.

**Pruebas (solo lógica, 3 pruebas)**
1. Entrega mayor al total: vuelto exacto.
2. Entrega igual al total: vuelto cero.
3. Entrega menor al total: faltante, no vuelto negativo.

**Checklist manual (VN, 3 comprobaciones)**
- [ ] El vuelto se lee bien de lejos (tamaño y contraste).
- [ ] Con entrega menor al total no muestra un vuelto negativo.
- [ ] Con pago mixto solo considera la parte en efectivo.

**Hecho cuando:** el componente funciona dentro de la pantalla de cobro y las 3 pruebas pasan.

---

### HU-007 · Arqueo y conciliación diaria (8 puntos)

**Como** propietario del ciber, **quiero** cerrar el turno comparando el efectivo contado contra lo registrado por el sistema, **para** eliminar los descuadres diarios de S/. 15 a S/. 30.
Dependencias técnicas: HU-006. Casos de uso y reglas: CU-003, RF-09, RN-05, RNF-05.

**Escenario 1. Balance del día**
- DADO QUE existen cobros registrados en la jornada,
- CUANDO el propietario ingresa el efectivo contado en caja,
- ENTONCES el sistema muestra el balance (Conforme, Faltante o Sobrante) separando efectivo, Yape/Plin y fiado.

**Escenario 2. Descuadre detectado**
- DADO QUE la diferencia entre lo contado y lo registrado supera S/. 2.00,
- CUANDO se calcula el balance,
- ENTONCES el sistema despliega una lista de auditoría con los cobros modificados o con saldo pendiente.

**Escenario 3. Cierre inmutable**
- DADO QUE el propietario pulsa "Cerrar Turno y Conciliar Caja",
- CUANDO el cierre finaliza,
- ENTONCES los registros del turno quedan en solo lectura (RN-05) y se genera un resumen consultable.

**Trabajo técnico**
- *Datos:* tabla de turnos (abierto en, cerrado en, estado `abierto` o `cerrado`, efectivo esperado, efectivo contado, diferencia, totales por método). Cada pago pertenece a un turno. Si no hay turno abierto al registrar el primer cobro, se abre uno automáticamente (decisión por defecto, confírmala con VN).
- *Lógica:* función pura `calculateBalance` que reciba los pagos del turno y el efectivo contado, y devuelva: efectivo esperado, totales de efectivo, Yape/Plin y fiado, diferencia y estado (`Conforme`, `Faltante`, `Sobrante`). El umbral de S/. 2.00 va como constante con nombre.
- *Auditoría:* si la diferencia supera S/. 2.00, listar los cobros del turno que estén **modificados** o que tengan **saldo pendiente** (fiados). Para saber si un cobro fue modificado, compara `updated_at` con `created_at` o usa un campo de modificación; elige lo más simple y regístralo.
- *Cierre inmutable (RN-05):* tras cerrar el turno, la capa de acceso a datos debe **rechazar** cualquier cambio a los pagos y sesiones de ese turno. **Excepción importante:** el campo `sync_status` y `updated_at` de sincronización sí deben poder cambiar, porque HU-008 marca los registros como sincronizados; no bloquees eso. El resumen del cierre se guarda y se puede consultar después.
- *Interfaz:* pestaña "Caja y Finanzas" con la tarjeta del día, campo para el efectivo contado, balance, lista de auditoría cuando corresponda y el botón "Cerrar Turno y Conciliar Caja" con confirmación. Una lista simple de turnos cerrados para consultar su resumen.

**Por confirmar con VN**
- Cuándo el balance es "Conforme": por defecto, **Conforme = diferencia exactamente 0; Faltante = contado menor que esperado; Sobrante = contado mayor**, y el umbral de S/. 2.00 solo decide si se muestra la lista de auditoría. Si el propietario quiere que una diferencia de hasta S/. 2.00 también sea "Conforme", cámbialo en la constante y avísame.

**Pruebas (solo lógica, máximo 6 pruebas en `calculateBalance` y en el cierre)**
1. Contado igual a lo esperado: Conforme.
2. Contado menor: Faltante con la diferencia correcta.
3. Contado mayor: Sobrante con la diferencia correcta.
4. Los totales separan bien efectivo, Yape/Plin y fiado.
5. Diferencia mayor a S/. 2.00: se pide la lista de auditoría; con S/. 2.00 o menos, no.
6. Turno cerrado: intentar modificar un pago lanza error, pero actualizar `sync_status` sí se permite.

**Checklist manual (VN, 6 comprobaciones)**
- [ ] Con 3 cobros de distintos métodos, el balance separa efectivo, Yape/Plin y fiado.
- [ ] Contar el efectivo justo da Conforme.
- [ ] Contar S/. 5 menos da Faltante y muestra la lista de auditoría.
- [ ] Cerrar el turno bloquea editar los cobros.
- [ ] El resumen del turno cerrado se puede consultar al día siguiente.
- [ ] Después del cierre, el siguiente cobro abre un turno nuevo.

**Hecho cuando:** se puede cerrar el turno, el cierre es inmutable sin bloquear la sincronización y las 6 pruebas pasan.

---

## 5. Política de pruebas de este sprint (simple, para no perder tiempo)

Las pruebas **no deben frenar el desarrollo**. Para este sprint:

- **Automáticas:** solo las que pide cada historia, sobre lógica pura (liquidación, validación de pagos, vuelto, balance). **Total: unas 19 pruebas.** Sin pruebas de interfaz, sin snapshots, sin pruebas de extremo a extremo.
- **Manuales:** el checklist corto de cada historia, que ejecuta VN en un celular **una sola vez, al final del sprint**. No hay ronda de gama baja por historia.
- **Puerta para pasar a revisión:** `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde, más una revisión rápida de otro integrante. El checklist manual lo hace VN después.
- Guarda los checklists en `docs/qa/checklist-HU-005.md`, `HU-006`, `HU-007` y `HU-010`, con las casillas vacías.
- Si una prueba falla porque el código está mal, arréglalo en tu propia historia. Nunca cambies una aserción ni uses `skip` para que pase.
- No modifiques las pruebas ni el código de HU-001 a HU-004. Si encuentras un fallo ahí, repórtalo.

---

## 6. Verificación antes de entregar

- [ ] Existen las fichas `docs/specs/HU-005.md`, `HU-006.md`, `HU-007.md` y `HU-010.md`, con los Given-When-Then sin cambios.
- [ ] Las migraciones son nuevas, ordenadas y no editan las anteriores. Toda tabla nueva tiene `id` UUID, `created_at`, `updated_at` y `sync_status`.
- [ ] Todos los montos son enteros en céntimos y no hay `number` decimal para dinero.
- [ ] No hay SQL fuera de `src/db/`.
- [ ] Todo funciona sin internet y no hay llamadas remotas.
- [ ] El cobro es atómico (una transacción).
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm test` pasan; la salida real está en el informe.
- [ ] Un PR por historia hacia `develop`, sin merge.
- [ ] Lo desconocido está marcado `Por confirmar`.

---

## 7. Informe final (respóndele a VN con esto)

1. Diagnóstico de 1.2: qué había en `develop` y qué faltaba.
2. Qué PR abriste (rama y enlace) y qué contiene cada uno.
3. Salida real de lint, tipos y pruebas.
4. Decisiones que tomaste por defecto y que VN debe confirmar (penalidad, "Conforme", fiado, apertura automática del turno).
5. Qué historias quedan listas para el checklist manual y cuáles no, con el motivo.
6. Lo que necesitas de VN.

## 8. Límites

- No cambies la pila tecnológica ni la estructura de `AGENTS.md`.
- No hagas merge, no apruebes PR, no cierres tareas, no toques Jira.
- No instales dependencias sin avisar.
- No implementes nada de HU-008 (sincronización) ni de HU-011 (fiados completos) en este sprint.
