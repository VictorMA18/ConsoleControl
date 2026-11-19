# Prueba de integración del flujo completo

| Campo             | Valor                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Tarea             | T19 (TW-19) · TW-132                                                  |
| Fecha             | 18/11/2026                                                            |
| Prueba automática | `__tests__/qa/flujo-sesion.test.ts` y las pruebas de `__tests__/app/` |
| Ejecución manual  | Emulador `ConsoleControl_GamaBaja` con Expo Go 58.0.5                 |
| Estado            | **Pasa**                                                              |

## Ejecución en el emulador

Pasos 1 a 4 con Switch #1, 1 mando y 30 min. Pasos 5 a 8 con la sesión de prueba "4. Sesión con 6 min restantes" de la pantalla de diagnóstico (PS3 #1, 30 min, iniciada 24 min 50 s antes), para no esperar media hora.

| Paso | Acción                     | Resultado esperado                          | Observado                                                                                                                        | Estado |
| ---- | -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Abrir el muro              | Consolas con su estado y mandos libres      | 5 tarjetas; Switch #1 "Disponible", 6 mandos libres                                                                              | Pasa   |
| 2    | Tocar Switch #1            | Se abre el diálogo con 1 mando y 1 hora     | Diálogo "Nueva sesión · Switch #1", 1 mando y 1 hora elegidos                                                                    | Pasa   |
| 3    | Elegir 30 min              | Total estimado S/ 4.00                      | "S/ 4.00"                                                                                                                        | Pasa   |
| 4    | Pulsar "Iniciar sesión"    | Vuelve al muro; la tarjeta pasa a rojo      | Switch #1 "En juego" con cronómetro                                                                                              | Pasa   |
| 5    | Mirar el cronómetro        | Avanza cada segundo desde la hora de inicio | PS3 #1 en 00:25:05 a los 15 s de iniciar la sesión de prueba                                                                     | Pasa   |
| 6    | Llegar a 5 minutos del fin | Ámbar titilante, aviso escrito y vibración  | "Por terminar" titilando, aviso "PS3 #1: faltan 5 minutos o menos" y vibración a las 17:53:30                                    | Pasa   |
| 7    | Seguir en alerta           | No se repite el aviso                       | Sin vibración nueva mientras la app siguió abierta; al recargar la app avisó una vez más (17:56:37), como está previsto (TW-111) | Pasa   |
| 8    | Llegar al fin              | "Tiempo cumplido" fijo hasta la liquidación | "Tiempo cumplido" en ámbar fijo, "Quedan 00:00:00", aviso y vibración a las 17:58:30                                             | Pasa   |

Las vibraciones se comprobaron en el registro del sistema (`adb shell dumpsys vibrator_manager`): tres, con el patrón 500 ms, 250 ms y 500 ms.

## Limitación

La prueba automática simula los repositorios (H-01). La transacción real de SQLite (consola "En juego" y mandos descontados) se comprobó en el emulador en los pasos 1 a 4: Switch #1 pasó a "En juego".
