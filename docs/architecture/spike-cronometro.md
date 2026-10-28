# Spike del cronómetro persistente · ConsoleControl Mobile

| Campo | Valor |
|---|---|
| Tarea | T10 (TW-10) · Servicio de cronómetro persistente |
| Subtarea | TW-82 · Spike de 2 h en un celular real |
| Autor | Victor Maldonado (VM) |
| Fecha | 23/10/2026 (preparación) · 28/10/2026 (ejecución) |
| Estado | **Ejecutado: enfoque confirmado** |

## 1. Pregunta

¿El tiempo de una sesión sigue siendo exacto si la app se minimiza, se cierra o el celular se reinicia? Es el mayor riesgo técnico del sprint (HU-002): Android puede pausar o cerrar la app en segundo plano.

## 2. Qué se compara

La pantalla `app/dev/spike-cronometro.tsx` (solo en desarrollo, enlace «Spike del cronómetro» en la pantalla inicial) muestra dos cronómetros a la vez:

| Cronómetro | Cómo mide | Hipótesis |
|---|---|---|
| A) Contador en memoria | Suma 1 cada segundo con `setInterval` | Se pausa en segundo plano y vuelve a 0 al cerrar la app |
| B) Hora de inicio en SQLite | `ahora − started_at` ([ADR 0003](../adr/0003-hora-de-inicio-persistida.md)) | Siempre muestra el tiempo real |

La pantalla también registra los cambios de estado de la app (`AppState`) y avisa cuando el intervalo estuvo pausado.

## 3. Procedimiento

Antes de cada caso se pulsa «Iniciar prueba» y se espera unos 10 segundos con la app abierta.

| # | Caso | Cómo se hace |
|---|---|---|
| C1 | Minimizar | Botón de inicio del celular, esperar 5 minutos, volver a la app |
| C2 | Cerrar | Cerrar Expo Go desde apps recientes, esperar 2 minutos, reabrir y entrar al spike |
| C3 | Reiniciar | Apagar y encender el celular, abrir Expo Go, `pnpm start` si se cortó, entrar al spike |
| C4 | Pantalla bloqueada | Bloquear la pantalla 5 minutos y desbloquear |

En cada caso se anota lo que muestran A y B al volver, comparado con el tiempo real medido con otro reloj.

## 4. Resultados

Celular Android con Expo Go (_modelo y versión de Android por completar_) · Fecha: 28/10/2026

| # | Caso | A) Contador en memoria | B) SQLite |
|---|---|---|---|
| C1 | Minimizar | ✅ Siguió contando | ✅ Siguió con el tiempo real |
| C2 | Cerrar | ❌ Volvió a 0 | ✅ Siguió con el tiempo real |
| C3 | Reiniciar | ❌ Volvió a 0 | ✅ Siguió con el tiempo real |
| C4 | Pantalla bloqueada | ❌ Volvió a 0 | ✅ Siguió con el tiempo real |

Observaciones:

- En C1 el contador en memoria no se pausó en 5 minutos. No es una garantía: con el ahorro de batería activo, más tiempo en segundo plano u otro modelo de celular, Android puede pausar o cerrar la app (ver TW-88).
- En C4 el contador en memoria volvió a 0, señal de que la app se recargó o el sistema la cerró mientras la pantalla estaba bloqueada.

## 5. Conclusión

**El enfoque del [ADR 0003](../adr/0003-hora-de-inicio-persistida.md) queda confirmado.** El cronómetro B, que calcula `ahora − started_at` con la hora guardada en SQLite, mostró el tiempo real en los cuatro casos. El contador en memoria se perdió en tres de cuatro casos, así que no sirve para cobrar.

No hace falta activar el plan B de T10. Se sigue con TW-85 (recalcular al volver del segundo plano) y TW-86 (restaurar las sesiones al arrancar).

## 6. Pruebas finales de HU-002 (TW-87)

Repiten los casos con la implementación definitiva: sesiones restauradas con `useActiveSessions` (TW-86), cronómetro de cada sesión con `useSessionTimer` y reloj compartido que se actualiza cada segundo (TW-84) y al volver del segundo plano (TW-85). Se usa la sección «Sesiones restauradas al abrir la app» de la pantalla del spike, con una misma sesión de 30 minutos para los tres casos.

Fecha: 28/10/2026 · Celular Android con Expo Go (_modelo y versión de Android por completar_)

| # | Caso | Resultado esperado | Resultado |
|---|---|---|---|
| P0 | App abierta | El tiempo avanza cada segundo y «faltan» baja | ✅ Cumple |
| P1 | Minimizar 5 minutos | Al volver, el tiempo salta de inmediato al valor real | ✅ Cumple |
| P2 | Cerrar y abrir la app | La sesión reaparece sola con el tiempo acumulado real | ✅ Cumple |
| P3 | Apagar y encender el celular | La sesión reaparece con el tiempo real, incluido el tiempo apagado | ✅ Cumple |

**Resultado:** se cumplen los dos escenarios de HU-002. Escenario 1: al minimizar o cerrar y reabrir, el tiempo es exacto. Escenario 2: tras apagar y encender el teléfono, las sesiones se restauran con el tiempo real.
