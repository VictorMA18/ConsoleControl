# Parte 03 · HU-006 Registro multimodal de cobro (5 puntos)

Rama: `feature/HU-006-cobro`, sobre la rama de la parte 02. Ficha: `docs/specs/hu-006-cobro.md`.

**Como** administrador del ciber, **quiero** registrar el pago como efectivo, Yape, Plin o fiado, incluso en forma mixta, **para** separar el dinero físico del digital y evitar descuadres.
Dependencias técnicas: HU-005. Casos de uso y reglas: CU-002, RF-06, RN-04.

## Criterios de aceptación (Given-When-Then)

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

## Trabajo

- **Datos (migración nueva):** tabla `payments`: sesión, método (`efectivo`, `yape`, `plin`, `fiado`), monto en céntimos y, para `fiado`, un nombre o apodo opcional. Una sesión con pago mixto tiene varias filas. Al cobrar, **en una sola transacción**: guardar los pagos, pasar la sesión a `cobrada`, devolver los mandos al inventario y dejar la consola "disponible". Si algo falla no queda nada a medias. Los cobros deben poder leerse por día y por método (HU-007 los usa).
- **Lógica:** validar con Zod que la suma sea exactamente el total de la liquidación de HU-005, que no haya montos negativos o cero y que haya al menos un método; si no coincide, rechazar con mensaje claro. Esquema en `src/schemas/`.
- **Interfaz:** en `app/cobro/[sessionId].tsx`, tras finalizar: selector de uno o varios métodos, monto por método con el resto precargado, `ChangeCalculator` (parte 02) cuando incluye efectivo, y el botón "Cobrar y Liberar" **deshabilitado** hasta que el pago esté clasificado y completo.
- **Uso de equipos:** deja el punto de llamada para acumular minutos de uso al cobrar (lo conecta HU-012 en el Sprint 3).

## Por confirmar con VN

- Fiado: aquí solo es un método de pago con nombre opcional. Saldos, abonos y límite de crédito son HU-011 (Sprint 4).

## Pruebas (lógica pura, `__tests__/schemas/payment.test.ts`)

1. Pago mixto (efectivo + Yape) que suma el total: acepta.
2. Pago mixto que no suma el total: rechaza.
3. Sin método elegido o con montos negativos o cero: rechaza (RN-04).

## Hecho cuando

El cobro es atómico, la consola solo se libera con el pago clasificado y completo, y las 3 pruebas están escritas. Lint y typecheck en verde.
