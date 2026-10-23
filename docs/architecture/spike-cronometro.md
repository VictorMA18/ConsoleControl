# Spike del cronómetro persistente · ConsoleControl Mobile

| Campo | Valor |
|---|---|
| Tarea | T10 (TW-10) · Servicio de cronómetro persistente |
| Subtarea | TW-82 · Spike de 2 h en un celular real |
| Autor | Victor Maldonado (VM) |
| Fecha | 23/10/2026 |
| Estado | **Pendiente de ejecutar en el celular** |

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

Celular: _modelo y versión de Android_ · Fecha: _dd/mm/aaaa_

| # | Tiempo real | A) Contador en memoria | B) SQLite | Eventos registrados | Observaciones |
|---|---|---|---|---|---|
| C1 | | | | | |
| C2 | | | | | |
| C3 | | | | | |
| C4 | | | | | |

## 5. Conclusión

_Pendiente._ Se completa después de la prueba:

- Si B es exacto en los cuatro casos, se confirma el enfoque del ADR 0003 y se sigue con TW-83 a TW-86.
- Si B falla en algún caso, se activa el plan B de T10: avisar al equipo para replantear el enfoque sin comprometer el sprint.
