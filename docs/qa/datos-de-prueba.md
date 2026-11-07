# Datos de prueba

| Campo  | Valor                                                                  |
| ------ | ---------------------------------------------------------------------- |
| Tarea  | T17 (TW-17) · TW-119                                                   |
| Fecha  | 06/11/2026                                                             |
| Fuente | `src/db/seedData.ts` y `src/services/tariff.ts` en `develop` (2d820b1) |
| Estado | **Provisional**                                                        |

**Aviso.** Las tarifas son las del seed y siguen provisionales: TW-12 está "En revisión" y el comentario de `seedData.ts` dice que el documento de T12 trae otros precios en sus tablas. Cuando TW-12 se cierre, hay que recalcular los montos de este archivo. Las consolas y mandos también son de ejemplo hasta tener el inventario real.

## Consolas y mandos

Cinco consolas, una por tipo, con 4 mandos cada una (`CONTROLLERS_PER_CONSOLE`). Inventario real: Por confirmar.

| Dato | Consola   | Tipo     | Mandos en el seed |
| ---- | --------- | -------- | ----------------- |
| D-01 | PS5 #1    | `ps5`    | 4                 |
|      | PS4 #1    | `ps4`    | 4                 |
|      | PS3 #1    | `ps3`    | 4                 |
|      | Xbox #1   | `xbox`   | 4                 |
|      | Switch #1 | `switch` | 4                 |

## Tarifario del seed

Montos en soles. `Precio` es el bloque con 1 mando. `Extra` es el recargo del bloque por cada mando desde el segundo (RN-01). En `ps5` y `switch`, desde el 4.º mando el extra lleva 30 % de descuento, redondeado hacia abajo a S/ 0.10.

| Tipo                    | 15 min      | 30 min      | 45 min      | 60 min       | 120 min      |
| ----------------------- | ----------- | ----------- | ----------- | ------------ | ------------ |
| `ps3` precio / extra    | 1.50 / 0.50 | 2.50 / 1.00 | 4.00 / 1.50 | 5.00 / 2.00  | 9.00 / 3.50  |
| `ps4` precio / extra    | 2.00 / 1.00 | 3.50 / 1.50 | 5.50 / 2.50 | 7.00 / 3.00  | 13.00 / 5.50 |
| `switch` precio / extra | 2.00 / 1.00 | 4.00 / 2.00 | 6.00 / 3.00 | 8.00 / 3.50  | 15.00 / 6.50 |
| `ps5` precio / extra    | 2.50 / 1.50 | 5.00 / 2.50 | 7.50 / 3.50 | 10.00 / 4.50 | 19.00 / 8.50 |
| `xbox` precio / extra   | 2.50 / 1.50 | 5.00 / 2.50 | 7.50 / 3.50 | 10.00 / 4.50 | 19.00 / 8.50 |

## Datos por caso

### D-02 · Sesión de referencia (CP-004, CP-005, CP-012)

PS5 #1 con `fijo_120` y 2 mandos, para que no venza durante la prueba. Otra consola en tiempo libre para CP-005. La referencia es un cronómetro externo.

### D-03 · CP-007, recargo por mando (provisional)

| Consola | Modalidad | Mandos | Cálculo         | Total esperado |
| ------- | --------- | ------ | --------------- | -------------- |
| PS4     | `fijo_60` | 1      | 7.00            | S/ 7.00        |
| PS4     | `fijo_60` | 2      | 7.00 + 3.00     | S/ 10.00       |
| PS4     | `fijo_60` | 3      | 7.00 + 3.00 × 2 | S/ 13.00       |
| PS5     | `fijo_60` | 2      | 10.00 + 4.50    | S/ 14.50       |

### D-04 · CP-008, tiempo fijo con 1 mando (provisional)

| Tipo     | `fijo_30` | `fijo_60` | `fijo_120` |
| -------- | --------- | --------- | ---------- |
| `ps3`    | S/ 2.50   | S/ 5.00   | S/ 9.00    |
| `ps4`    | S/ 3.50   | S/ 7.00   | S/ 13.00   |
| `switch` | S/ 4.00   | S/ 8.00   | S/ 15.00   |
| `ps5`    | S/ 5.00   | S/ 10.00  | S/ 19.00   |
| `xbox`   | S/ 5.00   | S/ 10.00  | S/ 19.00   |

### D-05 · CP-011, 6 mandos con `fijo_60` (provisional)

| Consola                       | Cálculo                     | Total esperado |
| ----------------------------- | --------------------------- | -------------- |
| PS4 (sin descuento)           | 7.00 + 3.00 × 5             | S/ 22.00       |
| Xbox (sin descuento)          | 10.00 + 4.50 × 5            | S/ 32.50       |
| PS5 (mandos 4.º a 6.º a 3.10) | 10.00 + 4.50 × 2 + 3.10 × 3 | S/ 28.30       |

El seed tiene 4 mandos por consola, así que hoy este caso no se puede ejecutar en el celular sin agregar mandos. Inventario para esta prueba: Por confirmar.

### D-06 · CP-013, cuatro consolas

PS5 #1, PS4 #1, Xbox #1 y Switch #1, cada una con `fijo_60` y 1 mando.

## Tiempos esperados

| Caso   | Dato      | Resultado esperado             |
| ------ | --------- | ------------------------------ |
| CP-009 | `fijo_30` | Aviso a los 25 min de iniciar  |
| CP-010 | `fijo_30` | "Tiempo Cumplido" a los 30 min |
