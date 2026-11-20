# Revisión de código

| Campo         | Valor                          |
| ------------- | ------------------------------ |
| Tarea         | T19 (TW-19) y hallazgos de T17 |
| Fecha         | 06/11/2026                     |
| Base revisada | `develop` en 2d820b1           |

Severidades: bloqueante, importante, menor.

## Hallazgos de las pruebas automáticas (T17)

| #    | Severidad | Hallazgo                                                                                                                                                                                                  | Efecto                                                                                                                                           |
| ---- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-01 | Mitigado  | `openSession` y `finishSession` usan la transacción de `expo-sqlite` y Jest no tiene un driver SQLite. No hay pruebas de `src/db/repositories/`, aunque `docs/guides/pruebas.md` las pide "si es posible" | No hay prueba automática de que la consola pase a `en_juego` ni de que los mandos pasen a `en_uso` (CP-001). Hoy se comprueba solo en el celular |

## Revisión por PR (T19)

No hay PR abiertos, así que no hubo nada que comentar en GitHub. Se revisaron los PR ya fusionados contra la Definition of Done y `AGENTS.md`.

| PR  | Tarea | Capas  | Tiempo desde `started_at` | Zod       | Pruebas                             | CI   | Aprobaciones |
| --- | ----- | ------ | ------------------------- | --------- | ----------------------------------- | ---- | ------------ |
| #5  | T02   | Cumple | No aplica                 | No aplica | No aplica                           | Pasa | 0            |
| #6  | T03   | Cumple | Cumple                    | No aplica | Solo seed; repositorios sin pruebas | Pasa | 0            |
| #7  | T09   | Cumple | Cumple                    | Cumple    | Sí                                  | Pasa | 0            |
| #8  | T10   | Cumple | Cumple                    | No aplica | Sí                                  | Pasa | 0            |
| #9  | T13   | Cumple | No aplica                 | No aplica | Sí                                  | Pasa | 0            |
| #10 | T15   | Cumple | Cumple                    | No aplica | Sí                                  | Pasa | 0            |

## Hallazgos de la revisión

| #    | Severidad  | Hallazgo                                                                                                                                              | Propuesta                                                              |
| ---- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| H-02 | Resuelto   | No hay interfaz de las historias: faltan T07, T08, T11, T14 y T16. Sin ellas no hay demo ni pruebas en el celular                                     | Interfaz completa en las ramas de T07, T08, T11, T14 y T16             |
| H-03 | Importante | Los PR #5 a #10 se fusionaron con 0 aprobaciones, y el #10 lo fusionó su propio autor. La regla es 1 aprobación de otra persona                       | Activar la protección de `develop` y `main`                            |
| H-04 | Resuelto   | HU-004 solo avisa con la app abierta (limitación L2 del spike). El spike decía decidir `expo-notifications` en T15 y no hay ADR sobre eso             | Decidido en el ADR 0011 (T16)                                          |
| H-05 | Resuelto   | HU-001 permite hasta 6 mandos, pero el seed trae 4 por consola. Con esos datos, 5 o 6 mandos siempre dan "mandos insuficientes"                       | Inventario definido en `tarifario.md` (T12): PS5 y Switch con 6 mandos |
| H-06 | Resuelto   | Las tarifas siguen provisionales y TW-12 está "En revisión". Los montos de CP-007, CP-008 y CP-011 pueden cambiar                                     | Tarifario aprobado en `tarifario.md` (T12)                             |
| H-07 | Menor      | `app/_layout.tsx` importa `src/db/migrate`: la Interfaz toca la capa de datos. ESLint no lo detecta porque solo bloquea `expo-sqlite` y `drizzle-orm` | Exponerlo por un servicio o aceptarlo como excepción de arranque       |
| H-08 | Menor      | `pnpm exec prettier --check .` falla en 14 archivos `.md`. `CONTRIBUTING.md` lo pide y CI no lo ejecuta                                               | Formatear o ignorar `.md`                                              |
| H-09 | Menor      | `pnpm install` modifica `pnpm-lock.yaml` en cada equipo (agrega `@pnpm/exe`)                                                                          | Confirmar el cambio una vez en una tarea de configuración              |
| H-10 | Resuelto   | Zustand, NativeWind y React Hook Form son parte del stack pero aún no están instalados                                                                | Instalados en T07 (Zustand, NativeWind) y T08 (React Hook Form)        |
| H-11 | Menor      | El seed incluye PS3, que `AGENTS.md` no lista entre las consolas del proyecto                                                                         | Confirmar con el inventario real                                       |
| H-12 | Menor      | `startSession` llama `console` a una variable y oculta el objeto global                                                                               | Renombrarla cuando se toque el archivo                                 |

Estos hallazgos no se corrigieron: son código de otros integrantes.

## Seguimiento al 18/11/2026

- H-01: sigue sin prueba automática; la transacción se comprobó en el emulador (`prueba-integracion.md`, pasos 1 a 4).
- H-03, H-07, H-08, H-09, H-11 y H-12 siguen abiertos y no bloquean el cierre del sprint.
- H-13 (observación de T18): con 4 cronómetros en pantalla la memoria del proceso pasó de 92.6 a 101.8 MB en 2 minutos, sin cierres ni bloqueos. Conviene repetir la medición durante 30 minutos en el Sprint 2 para descartar una fuga.
