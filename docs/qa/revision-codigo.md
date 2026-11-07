# Revisión de código

| Campo         | Valor                          |
| ------------- | ------------------------------ |
| Tarea         | T19 (TW-19) y hallazgos de T17 |
| Fecha         | 06/11/2026                     |
| Base revisada | `develop` en 2d820b1           |

Severidades: bloqueante, importante, menor.

## Hallazgos de las pruebas automáticas (T17)

| #    | Severidad  | Hallazgo                                                                                                                                                                                                  | Efecto                                                                                                                                           |
| ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-01 | Importante | `openSession` y `finishSession` usan la transacción de `expo-sqlite` y Jest no tiene un driver SQLite. No hay pruebas de `src/db/repositories/`, aunque `docs/guides/pruebas.md` las pide "si es posible" | No hay prueba automática de que la consola pase a `en_juego` ni de que los mandos pasen a `en_uso` (CP-001). Hoy se comprueba solo en el celular |
