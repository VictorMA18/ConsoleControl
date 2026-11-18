# Tarifario y regla de recargo

| Campo  | Valor                              |
| ------ | ---------------------------------- |
| Tarea  | T12 (TW-12) · TW-94 a TW-97        |
| Fecha  | 18/11/2026                         |
| Estado | Aprobado                           |
| Datos  | `src/db/seedData.ts` (`seedRates`) |
| Motor  | `src/services/tariff.ts` (T13)     |

## Aprobación

Revisión con cliente simulado: VN, en el rol de propietario del ciber, revisó la tabla, la regla de recargo y los casos de ejemplo, y los aprobó como tarifario vigente del MVP.

## Precios por bloque

Montos en soles. `Precio` es el bloque con 1 mando. `Extra` es el recargo del bloque por cada mando desde el segundo (RN-01).

| Tipo                  | 15 min      | 30 min      | 45 min      | 60 min       | 120 min      |
| --------------------- | ----------- | ----------- | ----------- | ------------ | ------------ |
| PS3 precio / extra    | 1.50 / 0.50 | 2.50 / 1.00 | 4.00 / 1.50 | 5.00 / 2.00  | 9.00 / 3.50  |
| PS4 precio / extra    | 2.00 / 1.00 | 3.50 / 1.50 | 5.50 / 2.50 | 7.00 / 3.00  | 13.00 / 5.50 |
| Switch precio / extra | 2.00 / 1.00 | 4.00 / 2.00 | 6.00 / 3.00 | 8.00 / 3.50  | 15.00 / 6.50 |
| PS5 precio / extra    | 2.50 / 1.50 | 5.00 / 2.50 | 7.50 / 3.50 | 10.00 / 4.50 | 19.00 / 8.50 |
| Xbox precio / extra   | 2.50 / 1.50 | 5.00 / 2.50 | 7.50 / 3.50 | 10.00 / 4.50 | 19.00 / 8.50 |

## Reglas

1. **RN-01, recargo por mando.** Cada bloque cobra el precio de la consola más un extra por cada mando desde el segundo.
2. **Descuento en grupos.** En PS5 y Switch, desde el 4.º mando el extra lleva 30 % de descuento, redondeado hacia abajo a S/ 0.10.
3. **RN-03, bloques con gracia.** El tiempo se cobra en bloques de 15 min con 3 min de gracia: de 1 a 18 min se cobran 15; de 19 a 33, 30; y así. El mínimo es un bloque.
4. **Tiempos largos.** Pasada la hora se suman bloques: primero los de 2 h, luego uno de 1 h y el resto (15, 30 o 45). Por ejemplo, 135 min = 120 + 15.
5. **Tiempo fijo.** Se cobra al menos lo contratado (30 min, 1 h o 2 h). Si se juega más, se cobra lo jugado.
6. **Tiempo libre.** No hay monto al iniciar: se calcula al cerrar con el tiempo jugado.

## Inventario

| Consola                 | Mandos |
| ----------------------- | ------ |
| PS3 #1, PS4 #1, Xbox #1 | 4      |
| PS5 #1, Switch #1       | 6      |

Los datos iniciales solo se cargan con la base vacía: un celular que ya tenía la app conserva su inventario anterior.

## Casos de ejemplo

Verificados en `__tests__/qa/hu-003-tarifas.test.ts`.

| #   | Consola | Modalidad | Mandos | Tiempo jugado         | Cálculo                     | Total    |
| --- | ------- | --------- | ------ | --------------------- | --------------------------- | -------- |
| 1   | PS4     | 1 h       | 1      | Hasta 1 h             | 7.00                        | S/ 7.00  |
| 2   | PS4     | 1 h       | 3      | Hasta 1 h             | 7.00 + 3.00 × 2             | S/ 13.00 |
| 3   | PS5     | 1 h       | 6      | Hasta 1 h             | 10.00 + 4.50 × 2 + 3.10 × 3 | S/ 28.30 |
| 4   | Xbox    | Libre     | 2      | 50 min (se cobran 60) | 10.00 + 4.50                | S/ 14.50 |
| 5   | Switch  | Libre     | 1      | 135 min (120 + 15)    | 15.00 + 2.00                | S/ 17.00 |
