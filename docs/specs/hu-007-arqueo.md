# HU-007: Arqueo y conciliación diaria

**Jira:** pendiente

**Como** propietario del ciber, **quiero** cerrar el turno comparando el efectivo contado contra lo registrado por el sistema, **para** eliminar los descuadres diarios de S/. 15 a S/. 30.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Por confirmar                      |
| Estimación                | 8 Story Points                     |
| Casos de uso / requisitos | CU-003, RF-09, RN-05, RNF-05       |
| Dependencias técnicas     | HU-006                             |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Balance del día

- DADO QUE existen cobros registrados en la jornada,
- CUANDO el propietario ingresa el efectivo contado en caja,
- ENTONCES el sistema muestra el balance (Conforme, Faltante o Sobrante) separando efectivo, Yape/Plin y fiado.

### Escenario 2. Descuadre detectado

- DADO QUE la diferencia entre lo contado y lo registrado supera S/. 2.00,
- CUANDO se calcula el balance,
- ENTONCES el sistema despliega una lista de auditoría con los cobros modificados o con saldo pendiente.

### Escenario 3. Cierre inmutable

- DADO QUE el propietario pulsa "Cerrar Turno y Conciliar Caja",
- CUANDO el cierre finaliza,
- ENTONCES los registros del turno quedan en solo lectura (RN-05) y se genera un resumen consultable.

## Notas técnicas

- Tabla `shifts` y columnas `payments.shift_id` y `payments.modified_at` (migración `0004_shifts`). El primer cobro abre un turno si no hay uno abierto.
- `calculateBalance` (`src/services/balance.ts`) es pura. Efectivo esperado = cobros en efectivo del turno (sin fondo inicial: por confirmar). Conforme solo con diferencia exacta de cero; el umbral de S/. 2.00 (`AUDIT_THRESHOLD_CENTS`) solo decide si se muestra la auditoría.
- Cobro "modificado": `payments.modified_at` no nulo, y no `updated_at ≠ created_at`, porque la sincronización (HU-008) también cambia `updated_at`. Saldo pendiente: los cobros en `fiado`.
- RN-05: `src/db/shiftLock.ts` (`isShiftLocked`, `assertShiftEditable`) rechaza cambios a los registros de un turno cerrado, salvo `sync_status` y `updated_at`. `updateSession` lo aplica; `markPaymentsSynced` es la vía permitida para la sincronización.
- Pantalla `app/caja/index.tsx` (enlace "Caja" en el muro) con la tarjeta del turno, efectivo contado, balance, auditoría, cierre con confirmación y la lista de turnos cerrados con su resumen. Sin barra de pestañas.
- Por confirmar con VN: el criterio de "Conforme" y la apertura automática del turno.
