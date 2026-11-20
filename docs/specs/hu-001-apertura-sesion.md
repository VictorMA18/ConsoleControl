# HU-001: Apertura de sesión de juego

**Jira:** TW-35

**Como** administrador del ciber, **quiero** iniciar una sesión eligiendo consola, cantidad de mandos (1 a 6) y modalidad, **para** dejar de anotar la hora de inicio en el cuaderno y controlar el alquiler de grupos numerosos.

| Campo | Valor |
|---|---|
| Prioridad MoSCoW | Must Have |
| Estimación | 5 Story Points (complejidad media) |
| Casos de uso / requisitos | CU-001, RF-01, RNF-02 |
| Dependencias técnicas | Inventario de consolas y mandos registrado, SQLite inicializada |
| Interesados | INT-01 Propietario / Administrador |
| Boceto | Muro de consolas con diálogo de configuración rápida (Anexo C del informe) |

## Criterios de aceptación (Given-When-Then)

### Escenario 1. Inicio exitoso
- DADO QUE la consola está en estado "Disponible" y existen mandos operativos suficientes,
- CUANDO el administrador toca la tarjeta de la consola, elige el número de mandos y la modalidad (tiempo fijo de 30 min, 1 h, 2 h o tiempo libre) y pulsa "Iniciar Sesión",
- ENTONCES el sistema cambia la consola a "En Juego", descuenta los mandos del stock, arranca el cronómetro y completa la operación en un máximo de 2 toques.

### Escenario 2. Mandos insuficientes
- DADO QUE el administrador solicita más mandos de los operativos en esa consola,
- CUANDO intenta iniciar la sesión,
- ENTONCES el sistema sugiere consolas alternativas con inventario completo y no inicia la sesión.

### Escenario 3. Consola ocupada
- DADO QUE la consola está "En Juego" o en mantenimiento,
- CUANDO el administrador intenta abrir una nueva sesión sobre ella,
- ENTONCES el sistema bloquea la asignación e informa el motivo.

## Tareas técnicas del Sprint 1
TW-7 (tarjeta y muro de consolas), TW-8 (diálogo de sesión), TW-9 (lógica de inicio con validaciones).