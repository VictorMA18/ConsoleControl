# ADR 0013 · Estados de sesión y cobro

## Estado

Aceptada

## Fecha

18/11/2026

## Contexto

Hasta el Sprint 1 una sesión solo era `activa` o `finalizada`, y finalizarla liberaba la consola. El Sprint 2 separa terminar el tiempo de cobrar (HU-005 y HU-006): la consola no debe quedar libre hasta que el pago esté clasificado (RN-04).

## Decisión

- Estados de la sesión: `activa` → `por_cobrar` (HU-005) → `cobrada` (HU-006). `finalizada` se conserva solo como cierre sin cobro de las herramientas de desarrollo.
- Al pasar a `por_cobrar` se guarda `ended_at` y la liquidación (`played_minutes`, `charged_minutes`, `penalty_cents` y `total_cents`), de modo que el cobro y el arqueo lean el mismo número.
- Mientras está `por_cobrar`, la consola sigue `en_juego` y sus mandos `en_uso`; la tarjeta del muro muestra "Por cobrar" con el tiempo detenido y el total.
- Dinero siempre en céntimos enteros (ya vigente en `total_cents`); no hace falta otro ADR.

## Alternativas descartadas

- Liberar la consola al finalizar y cobrar después: permitiría iniciar otra sesión con un pago sin clasificar (RN-04).
- Guardar solo `total_cents` y recalcular el resto: el cobro y el arqueo dependerían de recalcular con tarifas que pueden cambiar.

## Consecuencias

- Las consultas de sesiones activas y pendientes de cobro son separadas (`getActiveSessionsWithConsole`, `getPendingSessionsWithConsole`); el muro une ambas.
- Una migración nueva (`0002_settlement_columns`) agrega las tres columnas de liquidación.
- HU-006: el pago se guarda en `payments`, una fila por método. Cobrar es una sola transacción: pagos, sesión `cobrada`, consola `disponible` y mandos `operativo`.
- La parte de HU-007 agrega a este ADR el turno.
