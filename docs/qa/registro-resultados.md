# Registro de resultados

| Campo              | Valor                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Tarea              | T17 (TW-17) · TW-120; ejecución de T18 (TW-18)                                                          |
| Fecha de ejecución | 18/11/2026                                                                                              |
| Dispositivo        | Emulador Android `ConsoleControl_GamaBaja`: Android 17, 720 × 1600, 3 GB de RAM, 8 GB de almacenamiento |
| Versión            | APK `pe.thewolfs.consolecontrol` 1.0.0, build de EAS 9ee60139 (commit 520f73d)                          |

Método: toques y capturas de pantalla con `adb` sobre el emulador; la hora del equipo sirve de cronómetro de referencia.

Valores de `Resultado`: `Aprobó`, `Falló`, `Bloqueado`, `No ejecutado`.

CP-009 y CP-010 se ejecutaron en Expo Go sobre el mismo emulador con la sesión de prueba "4. Sesión que vence en 5 min", que solo existe en la app de desarrollo; en el APK habría que esperar 25 minutos.

| Caso            | Fecha            | Ejecutado por | Dispositivo                                                                                                    | Resultado | Evidencia                                                                                                                                      | Defecto (Jira)     |
| --------------- | ---------------- | ------------- | -------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| CP-001          | 18/11/2026 18:55 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-001_2026-11-18.png`](evidencias/CP-001_2026-11-18.png)                                                                                    |                    |
| CP-002          | 18/11/2026 18:56 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-002_2026-11-18.png`](evidencias/CP-002_2026-11-18.png)                                                                                    | TW-148 (corregido) |
| CP-003          | 18/11/2026 18:56 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-003_2026-11-18.png`](evidencias/CP-003_2026-11-18.png)                                                                                    |                    |
| CP-004          | 18/11/2026 18:58 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-004_1min_2026-11-18.png`](evidencias/CP-004_1min_2026-11-18.png), [`CP-004_2min_2026-11-18.png`](evidencias/CP-004_2min_2026-11-18.png)   |                    |
| CP-005          | 18/11/2026 19:04 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-005_2026-11-18.png`](evidencias/CP-005_2026-11-18.png)                                                                                    |                    |
| CP-006          | 18/11/2026 18:57 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139; ámbar en Mismo emulador · Expo Go 58.0.5 | Aprobó    | [`CP-013_2026-11-18.png`](evidencias/CP-013_2026-11-18.png), [`CP-009_2026-11-18.png`](evidencias/CP-009_2026-11-18.png)                       |                    |
| CP-007          | 18/11/2026 18:56 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-007_2026-11-18.png`](evidencias/CP-007_2026-11-18.png)                                                                                    |                    |
| CP-008          | 18/11/2026 18:56 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-008_2026-11-18.png`](evidencias/CP-008_2026-11-18.png)                                                                                    |                    |
| CP-009          | 18/11/2026 17:53 | VN (QA)       | Mismo emulador · Expo Go 58.0.5                                                                                | Aprobó    | [`CP-009_2026-11-18.png`](evidencias/CP-009_2026-11-18.png)                                                                                    |                    |
| CP-010          | 18/11/2026 17:58 | VN (QA)       | Mismo emulador · Expo Go 58.0.5                                                                                | Aprobó    | [`CP-010_2026-11-18.png`](evidencias/CP-010_2026-11-18.png), [`CP-010_reapertura_2026-11-18.png`](evidencias/CP-010_reapertura_2026-11-18.png) |                    |
| CP-011          | 18/11/2026 18:57 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-011_2026-11-18.png`](evidencias/CP-011_2026-11-18.png)                                                                                    |                    |
| CP-012          | 18/11/2026 19:03 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-012_2026-11-18.png`](evidencias/CP-012_2026-11-18.png)                                                                                    |                    |
| CP-013          | 18/11/2026 19:07 | VN (QA)       | Emulador `ConsoleControl_GamaBaja` (Android 17, 3 GB) · APK 9ee60139                                           | Aprobó    | [`CP-013_2026-11-18.png`](evidencias/CP-013_2026-11-18.png)                                                                                    |                    |
| TW-129 (CP-002) | 18/11/2026 19:13 | VN (QA)       | Mismo emulador · Expo Go 58.0.5 con la corrección de TW-148                                                    | Aprobó    | [`TW-129_2026-11-18.png`](evidencias/TW-129_2026-11-18.png)                                                                                    | TW-148             |

## Resumen

13 de 13 casos aprobados. Defectos encontrados: TW-147 (build de EAS, bloqueante) y TW-148 (aviso de mandos que no se borraba, media); ambos corregidos y repetidos.
