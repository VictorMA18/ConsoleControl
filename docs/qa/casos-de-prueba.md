# Casos de prueba · HU-001 a HU-004

| Campo  | Valor                                                  |
| ------ | ------------------------------------------------------ |
| Tarea  | T17 (TW-17) · TW-118 y TW-121                          |
| Fecha  | 06/11/2026                                             |
| Fuente | `docs/specs/`; el Given-When-Then se copia sin cambios |

Trece casos: diez de los escenarios de las historias y tres de borde. Todas las historias son Must Have, así que todos los casos tienen prioridad alta. Los datos están en [`datos-de-prueba.md`](datos-de-prueba.md) y los resultados se registran en [`registro-resultados.md`](registro-resultados.md).

**Tipos:** `Automática` (la cubre Jest), `Automática + manual` (Jest cubre la lógica y falta comprobar en el celular lo que se ve o se siente), `Manual en dispositivo`.

## CP-001 · Inicio exitoso

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-001                                    |
| Escenario         | Inicio exitoso                            |
| Prioridad         | Alta                                      |
| Tipo              | Automática + manual                       |
| Tarea técnica     | T07, T08, T09                             |
| Datos de entrada  | D-01 (PS5 #1), 2 mandos, `fijo_60`        |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- La base tiene datos iniciales cargados.
- La consola de prueba está en "Disponible" con mandos operativos.

**Pasos**

1. Abrir el muro de consolas.
2. Tocar la tarjeta de la consola.
3. Elegir el número de mandos y la modalidad.
4. Pulsar "Iniciar Sesión".

**Criterio (Given-When-Then)**

- DADO QUE la consola está en estado "Disponible" y existen mandos operativos suficientes,
- CUANDO el administrador toca la tarjeta de la consola, elige el número de mandos y la modalidad (tiempo fijo de 30 min, 1 h, 2 h o tiempo libre) y pulsa "Iniciar Sesión",
- ENTONCES el sistema cambia la consola a "En Juego", descuenta los mandos del stock, arranca el cronómetro y completa la operación en un máximo de 2 toques.

**Resultado esperado:** La consola pasa a "En Juego", sus mandos quedan descontados del stock, arranca el cronómetro y la operación toma un máximo de 2 toques.

## CP-002 · Mandos insuficientes

| Campo             | Valor                                                 |
| ----------------- | ----------------------------------------------------- |
| Historia          | HU-001                                                |
| Escenario         | Mandos insuficientes                                  |
| Prioridad         | Alta                                                  |
| Tipo              | Automática                                            |
| Tarea técnica     | T08, T09                                              |
| Datos de entrada  | D-01 (PS5 #1), 5 mandos (el seed tiene 4 por consola) |
| Prueba automática | Se indica en el PR de pruebas automáticas             |

**Precondiciones**

- La consola está "Disponible".
- Hay al menos otra consola disponible con stock suficiente.

**Pasos**

1. Tocar la tarjeta de la consola.
2. Elegir más mandos de los operativos.
3. Pulsar "Iniciar Sesión".

**Criterio (Given-When-Then)**

- DADO QUE el administrador solicita más mandos de los operativos en esa consola,
- CUANDO intenta iniciar la sesión,
- ENTONCES el sistema sugiere consolas alternativas con inventario completo y no inicia la sesión.

**Resultado esperado:** La sesión no se inicia y el sistema sugiere consolas alternativas con stock suficiente.

## CP-003 · Consola ocupada

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-001                                    |
| Escenario         | Consola ocupada                           |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T08, T09                                  |
| Datos de entrada  | D-01 (PS5 #1) con una sesión activa       |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- La consola está "En Juego" o en mantenimiento.

**Pasos**

1. Tocar la tarjeta de la consola.
2. Intentar abrir una nueva sesión.

**Criterio (Given-When-Then)**

- DADO QUE la consola está "En Juego" o en mantenimiento,
- CUANDO el administrador intenta abrir una nueva sesión sobre ella,
- ENTONCES el sistema bloquea la asignación e informa el motivo.

**Resultado esperado:** La asignación se bloquea y el sistema informa el motivo.

## CP-004 · App minimizada

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-002                                    |
| Escenario         | App minimizada                            |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T10                                       |
| Datos de entrada  | D-02 (sesión de referencia)               |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Existe al menos una sesión activa.

**Pasos**

1. Anotar el tiempo mostrado y la hora de un cronómetro de referencia.
2. Minimizar la app, o cerrarla y volver a abrirla.
3. Comparar el tiempo mostrado con la referencia.

**Criterio (Given-When-Then)**

- DADO QUE existe al menos una sesión activa,
- CUANDO el administrador minimiza la aplicación o la cierra y la vuelve a abrir,
- ENTONCES el tiempo transcurrido de cada sesión es exacto, sin reinicios ni pérdida de precisión.

**Resultado esperado:** El tiempo es `ahora − started_at`: incluye el tiempo fuera de la app, sin reinicios.

## CP-005 · Reinicio del teléfono

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-002                                    |
| Escenario         | Reinicio del teléfono                     |
| Prioridad         | Alta                                      |
| Tipo              | Automática + manual                       |
| Tarea técnica     | T10                                       |
| Datos de entrada  | D-02, con dos consolas                    |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Existen sesiones activas.

**Pasos**

1. Anotar la hora.
2. Apagar el teléfono y volver a encenderlo.
3. Abrir la app.
4. Comparar el tiempo de cada sesión con la referencia.

**Criterio (Given-When-Then)**

- DADO QUE existen sesiones activas,
- CUANDO el teléfono se apaga y se vuelve a encender,
- ENTONCES el sistema restaura las sesiones desde SQLite con el tiempo real transcurrido.

**Resultado esperado:** Las sesiones se restauran desde SQLite como `activa`, con el tiempo real, incluido el tiempo apagado.

## CP-006 · Código cromático

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-002                                    |
| Escenario         | Código cromático                          |
| Prioridad         | Alta                                      |
| Tipo              | Automática + manual                       |
| Tarea técnica     | T11                                       |
| Datos de entrada  | D-01 con sesión `fijo_30`                 |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- El muro de consolas está visible.

**Pasos**

1. Observar una consola disponible.
2. Iniciarle una sesión.
3. Esperar a que falten 5 minutos o menos.

**Criterio (Given-When-Then)**

- DADO QUE el muro de consolas está visible,
- CUANDO el estado de una consola cambia,
- ENTONCES su tarjeta muestra verde (disponible), rojo (en juego) o ámbar (próxima a terminar o tiempo cumplido).

**Resultado esperado:** La tarjeta se ve verde (disponible), rojo (en juego) y ámbar (próxima a terminar o tiempo cumplido).

## CP-007 · Recargo por mando adicional

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-003                                    |
| Escenario         | Recargo por mando adicional               |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T12, T13                                  |
| Datos de entrada  | D-03 (montos de CP-007)                   |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Tarifas del seed cargadas (provisionales, ver `datos-de-prueba.md`).

**Pasos**

1. Abrir el diálogo de sesión.
2. Elegir varios mandos y una modalidad.
3. Revisar el total calculado.

**Criterio (Given-When-Then)**

- DADO QUE una sesión tiene más de un mando asignado,
- CUANDO el sistema calcula la tarifa,
- ENTONCES suma el recargo por cada mando extra a partir del segundo jugador (RN-01).

**Resultado esperado:** El total suma un recargo por cada mando desde el segundo, según la tabla de `datos-de-prueba.md`.

## CP-008 · Tiempo fijo

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-003                                    |
| Escenario         | Tiempo fijo                               |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T12, T13, T14                             |
| Datos de entrada  | D-04 (tarifario por consola y modalidad)  |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Tarifas del seed cargadas (provisionales).

**Pasos**

1. Elegir una modalidad de tiempo fijo con 1 mando.
2. Revisar el monto.

**Criterio (Given-When-Then)**

- DADO QUE se eligió una modalidad de tiempo fijo,
- CUANDO se calcula el monto,
- ENTONCES coincide con el tarifario vigente para ese tipo de consola.

**Resultado esperado:** El monto coincide con el tarifario de ese tipo de consola, según la tabla de `datos-de-prueba.md`.

## CP-009 · Aviso previo (5 minutos antes)

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-004                                    |
| Escenario         | Aviso previo (5 minutos antes)            |
| Prioridad         | Alta                                      |
| Tipo              | Automática + manual                       |
| Tarea técnica     | T15, T16                                  |
| Datos de entrada  | D-01 con `fijo_30`                        |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Hay una sesión de tiempo fijo en curso.
- La app está abierta (sin ella no hay aviso: limitación L2 del spike).

**Pasos**

1. Iniciar una sesión `fijo_30`.
2. Esperar a que falten 5 minutos.
3. Observar la tarjeta y el teléfono.

**Criterio (Given-When-Then)**

- DADO QUE una sesión de tiempo fijo está en curso,
- CUANDO faltan 5 minutos para su vencimiento,
- ENTONCES la tarjeta de la consola pasa a ámbar titilante y el teléfono vibra (RN-02).

**Resultado esperado:** A los 25 minutos la tarjeta pasa a ámbar titilante y el teléfono vibra una vez.

## CP-010 · Tiempo cumplido

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | HU-004                                    |
| Escenario         | Tiempo cumplido                           |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T15                                       |
| Datos de entrada  | D-01 con `fijo_30`                        |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- El tiempo de una sesión fija se agotó.
- La sesión no se ha finalizado.

**Pasos**

1. Esperar a que venza la sesión.
2. No finalizarla.
3. Cerrar y reabrir la app.

**Criterio (Given-When-Then)**

- DADO QUE el tiempo de la sesión se agotó,
- CUANDO el administrador aún no la finaliza,
- ENTONCES la consola queda en "Tiempo Cumplido" hasta su liquidación.

**Resultado esperado:** La consola sigue en "Tiempo Cumplido" hasta su liquidación, también tras reabrir la app.

## CP-011 · Sesión con 6 mandos (el máximo)

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | Caso de borde (TW-121)                    |
| Escenario         | Sesión con 6 mandos (el máximo)           |
| Prioridad         | Alta                                      |
| Tipo              | Automática                                |
| Tarea técnica     | T09, T13                                  |
| Datos de entrada  | D-05 (6 mandos)                           |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- La consola tiene 6 mandos operativos. El seed solo trae 4 por consola: en el celular hace falta inventario real (Por confirmar).

**Pasos**

1. Elegir 6 mandos.
2. Iniciar la sesión.
3. Revisar el total.

**Resultado esperado:** Se aceptan 6 mandos, no se aceptan 7, y el total coincide con D-05.

## CP-012 · Cierre de la app a mitad de sesión y reapertura

| Campo             | Valor                                           |
| ----------------- | ----------------------------------------------- |
| Historia          | Caso de borde (TW-121)                          |
| Escenario         | Cierre de la app a mitad de sesión y reapertura |
| Prioridad         | Alta                                            |
| Tipo              | Manual en dispositivo                           |
| Tarea técnica     | T10                                             |
| Datos de entrada  | D-02                                            |
| Prueba automática | Se indica en el PR de pruebas automáticas       |

**Precondiciones**

- Hay una sesión activa.

**Pasos**

1. Anotar el tiempo mostrado.
2. Forzar el cierre de la app desde Ajustes.
3. Esperar 2 minutos.
4. Abrir la app.

**Resultado esperado:** La sesión reaparece sola y el tiempo incluye los 2 minutos.

## CP-013 · 4 consolas con sesiones simultáneas

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| Historia          | Caso de borde (TW-121)                    |
| Escenario         | 4 consolas con sesiones simultáneas       |
| Prioridad         | Alta                                      |
| Tipo              | Manual en dispositivo                     |
| Tarea técnica     | T07, T10, T11                             |
| Datos de entrada  | D-06 (cuatro consolas)                    |
| Prueba automática | Se indica en el PR de pruebas automáticas |

**Precondiciones**

- Hay 4 consolas disponibles.
- El celular es de gama baja.

**Pasos**

1. Iniciar una sesión en cada consola.
2. Navegar por el muro durante 10 minutos.
3. Anotar si la app se traba o se cierra.

**Resultado esperado:** Los 4 cronómetros avanzan a la vez, cada uno con su tiempo, sin bloqueos ni cierres.
