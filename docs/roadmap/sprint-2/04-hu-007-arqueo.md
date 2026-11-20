# Parte 04 · HU-007 Arqueo y conciliación diaria (8 puntos)

Rama: `feature/HU-007-arqueo`, sobre la rama de la parte 03. Ficha: `docs/specs/hu-007-arqueo.md`.

**Como** propietario del ciber, **quiero** cerrar el turno comparando el efectivo contado contra lo registrado por el sistema, **para** eliminar los descuadres diarios de S/. 15 a S/. 30.
Dependencias técnicas: HU-006. Casos de uso y reglas: CU-003, RF-09, RN-05, RNF-05.

## Criterios de aceptación (Given-When-Then)

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

## Trabajo

- **Datos (migración nueva):** tabla `shifts` (abierto en, cerrado en, estado `abierto` o `cerrado`, efectivo esperado, efectivo contado, diferencia y totales por método). Cada pago pertenece a un turno (`shift_id` en `payments`). Si no hay turno abierto al registrar el primer cobro, se abre uno automáticamente.
- **Lógica:** función pura `calculateBalance` (pagos del turno + efectivo contado) que devuelve efectivo esperado, totales de efectivo, Yape/Plin y fiado, diferencia y estado (`Conforme`, `Faltante`, `Sobrante`). Umbral de S/. 2.00 como constante con nombre.
- **Auditoría:** si la diferencia supera S/. 2.00, listar los cobros del turno **modificados** (`updated_at` distinto de `created_at`) o con **saldo pendiente** (fiados). Es lo más simple; regístralo en el ADR 0013.
- **Cierre inmutable (RN-05):** tras cerrar, el acceso a datos rechaza cambios a los pagos y sesiones del turno. **Excepción:** `sync_status` y `updated_at` deben poder cambiar para que HU-008 marque los registros como sincronizados. `controlColumns` reinicia `sync_status` a `pendiente` en cada update: revisa que esa regla no rompa el cierre y deja una función de acceso a datos que marque `sincronizado`. La decisión de bloqueo va en una función pura `isShiftLocked(shift)`.
- **Interfaz:** pantalla `app/caja/` (sin tab bar; enlace "Caja" en el muro) con la tarjeta del día, campo de efectivo contado, balance, lista de auditoría cuando corresponda y "Cerrar Turno y Conciliar Caja" con confirmación. Lista simple de turnos cerrados con su resumen.

## Por confirmar con VN

- Por defecto: Conforme = diferencia exactamente 0; Faltante = contado menor; Sobrante = contado mayor. S/. 2.00 solo decide si se muestra la auditoría. Se cambia en una constante si el propietario quiere otra cosa.
- Apertura automática del turno al primer cobro.

## Pruebas (lógica pura, `__tests__/services/balance.test.ts`)

1. Contado igual, menor y mayor: Conforme, Faltante y Sobrante con la diferencia correcta.
2. Los totales separan bien efectivo, Yape/Plin y fiado.
3. Diferencia mayor a S/. 2.00 pide auditoría; con S/. 2.00 o menos, no.
4. `isShiftLocked`: un turno cerrado bloquea cambios a pagos, pero permite actualizar `sync_status`.

## Hecho cuando

Se puede cerrar el turno, el cierre es inmutable sin bloquear la sincronización y las 4 pruebas están escritas. Lint y typecheck en verde.
