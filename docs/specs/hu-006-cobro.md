# HU-006: Registro multimodal de cobro

**Jira:** pendiente

**Como** administrador del ciber, **quiero** registrar el pago como efectivo, Yape, Plin o fiado, incluso en forma mixta, **para** separar el dinero físico del digital y evitar descuadres.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Por confirmar                      |
| Estimación                | 5 Story Points                     |
| Casos de uso / requisitos | CU-002, RF-06, RN-04               |
| Dependencias técnicas     | HU-005                             |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Cobro simple

- DADO QUE se muestra el resumen de cobro,
- CUANDO el administrador elige un método de pago y pulsa "Cobrar y Liberar",
- ENTONCES el sistema registra el ingreso discriminado por método, actualiza la caja del día y deja la consola en "Disponible".

### Escenario 2. Pago mixto

- DADO QUE el cliente paga una parte en efectivo y otra por Yape,
- CUANDO el administrador desglosa los dos montos,
- ENTONCES el sistema acepta el pago solo si la suma iguala el total.

### Escenario 3. Restricción de liberación

- DADO QUE el pago no ha sido clasificado,
- CUANDO el administrador intenta liberar la consola,
- ENTONCES el sistema lo impide (RN-04).

## Notas técnicas

- Tabla `payments` (migración `0003_payments`): una fila por método, monto en céntimos, nombre del cliente opcional en `fiado`.
- `registerPayments` (`src/db/repositories/paymentRepository.ts`) hace todo en una transacción: guarda los pagos, pasa la sesión a `cobrada`, libera la consola y devuelve los mandos. Deja el punto donde HU-012 acumulará las horas de uso.
- Validación con Zod en `src/schemas/payment.ts`: al menos un método, sin repetirse, montos mayores a cero y suma igual al total.
- `getDailyTotals` lee lo cobrado en el día por método; lo usa el arqueo de HU-007.
- Pantalla: el formulario `PaymentForm` está en `app/cobro/[sessionId].tsx`; en efectivo muestra el `ChangeCalculator` de HU-010. "Cobrar y Liberar" está deshabilitado hasta que el pago esté completo.
- Por confirmar con VN: `fiado` es solo un método de pago con nombre opcional; saldos, abonos y límite de crédito son de HU-011.
