# Prueba de integración del flujo completo

| Campo             | Valor                                              |
| ----------------- | -------------------------------------------------- |
| Tarea             | T19 (TW-19) · TW-132                               |
| Fecha             | 06/11/2026                                         |
| Prueba automática | `__tests__/qa/flujo-sesion.test.ts`                |
| Estado            | Parcial: lógica pasa; flujo con interfaz bloqueado |

Datos: PS5 #1, 1 mando, `fijo_30` (ver [`datos-de-prueba.md`](datos-de-prueba.md)).

| Paso | Acción                     | Resultado esperado                                            | Estado                                 |
| ---- | -------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| 1    | Abrir el muro de consolas  | Se ven las consolas; PS5 #1 en verde                          | Bloqueado por T07                      |
| 2    | Tocar la tarjeta de PS5 #1 | Se abre el diálogo de sesión                                  | Bloqueado por T07 y T08                |
| 3    | Elegir 1 mando y `fijo_30` | El diálogo muestra el total estimado de S/ 5.00 (provisional) | Bloqueado por T08 y T14                |
| 4    | Pulsar "Iniciar Sesión"    | Se crea la sesión. La tarjeta pasa a rojo                     | Lógica: pasa. Vista: bloqueado por T11 |
| 5    | Esperar 10 minutos         | El cronómetro marca 10 minutos                                | Lógica: pasa. Vista: bloqueado por T11 |
| 6    | Esperar a los 25 minutos   | Aviso de "próxima a vencer"; ámbar titilante y vibración      | Lógica: pasa. Vista: bloqueado por T16 |
| 7    | Seguir en el minuto 26     | No se repite el aviso                                         | Lógica: pasa                           |
| 8    | Esperar a los 30 minutos   | Estado "Tiempo cumplido" hasta la liquidación                 | Lógica: pasa. Vista: bloqueado por T16 |

La prueba automática simula los repositorios, así que no comprueba SQLite real (ver H-01 en [`revision-codigo.md`](revision-codigo.md)). Falta repetir los ocho pasos en el celular cuando exista la interfaz.
