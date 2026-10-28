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

## 7. Limitaciones conocidas (TW-88)

El tiempo de una sesión **nunca se pierde**, porque se calcula desde `started_at` guardado en SQLite. Las limitaciones afectan a lo que la app puede **hacer o mostrar** mientras no está en primer plano.

| # | Limitación | Causa | Impacto | Mitigación |
|---|---|---|---|---|
| L1 | Android pausa o cierra la app en segundo plano | Ahorro de batería (modo Doze) y gestores de batería de cada fabricante, más agresivos en Xiaomi, Huawei, Oppo y Samsung | El cronómetro deja de refrescarse y la app puede cerrarse, como en el caso C4 del spike. El tiempo sigue siendo exacto al volver | Ya resuelto: el reloj compartido se detiene en segundo plano y se actualiza al volver (TW-85), y las sesiones se restauran al abrir la app (TW-86) |
| L2 | **Sin alertas con la app cerrada o en segundo plano** | Mientras Android pausa la app no se ejecuta código, así que nada puede avisar a los 5 minutos ni hacer vibrar el celular | **Afecta a HU-004 (T15 y T16):** si el administrador minimiza la app, la alerta llegaría tarde, recién al volver a abrirla | Programar una **notificación local** con `expo-notifications` al iniciar cada sesión de tiempo fijo, para `started_at + duración − 5 min`. Android la muestra aunque la app esté cerrada. Requiere un ADR nuevo y se decide en T15 |
| L3 | Cambio manual de la hora del celular | El cálculo usa la hora del sistema ([ADR 0003](../adr/0003-hora-de-inicio-persistida.md)) | Si se adelanta o atrasa la hora, el tiempo y el cobro cambian. Si queda antes de `started_at`, se muestra 0 y no un negativo | Dejar activa la **hora automática** en el celular del ciber. Se revisa al hacer la sincronización (HU-008) |
| L4 | Tras reiniciar el celular la app no se abre sola | Android no reabre las apps al encender | Las sesiones no se ven hasta abrir la app; al abrirla aparecen con el tiempo real | Aceptado para el MVP: no hay pérdida de datos |
| L5 | Pruebas hechas solo en Expo Go y en un celular | Es el entorno de desarrollo del Sprint 1 | El APK final y otros modelos pueden gestionar el segundo plano de otra forma | Repetir P1 a P3 con el APK de T19 y, si es posible, en el celular real del ciber |
| L6 | El cronómetro se refresca cada segundo, no en tiempo continuo | Se refresca al cambiar el segundo del reloj (TW-84) | Diferencia máxima de 1 segundo en pantalla | Aceptado: el cobro se calcula desde `started_at` y no desde lo mostrado |

### Recomendaciones

- **Para el celular del ciber:** activar la hora automática y excluir la app del ahorro de batería (Ajustes → Batería → la app → «Sin restricciones»). Así las notificaciones de HU-004 llegan a tiempo.
- **Para T15 y T16 (HU-004):** decidir con el equipo si se agregan notificaciones locales (L2). Sin ellas, la alerta de 5 minutos solo funciona con la app abierta en pantalla.
