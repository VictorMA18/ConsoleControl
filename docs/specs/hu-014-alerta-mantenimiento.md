# HU-014: Alerta de mantenimiento preventivo

**Jira:** pendiente

**Como** propietario del ciber, **quiero** recibir una alerta cuando una consola alcance un umbral de horas de uso, **para** programar limpieza o cambio de pasta térmica antes de que falle.

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| Prioridad MoSCoW          | Could Have                         |
| Estimación                | 3 Story Points                     |
| Casos de uso / requisitos | CU-004, RF-11                      |
| Dependencias técnicas     | HU-012                             |
| Interesados               | INT-01 Propietario / Administrador |

## Criterios de aceptación (Given-When-Then)

- DADO QUE una consola acumula horas de uso con cada sesión cobrada,
- CUANDO alcanza el umbral configurado (por ejemplo, 150 h para limpieza o 500 h para pasta térmica),
- ENTONCES el sistema muestra una alerta de mantenimiento y reinicia el contador al registrarse la intervención.

## Notas técnicas

- **Historial:** tabla `maintenances` (migración 0008) con la consola, el tipo (`limpieza` o `pasta_termica`) y las horas de uso que tenía al intervenirla (`usage_minutes_at`).
- **Contador:** `consoles.usage_minutes` nunca se pone a cero. Las horas desde la última intervención son las acumuladas menos las registradas en la última intervención de ese tipo (`minutesSinceLast`).
- **Lógica:** `getMaintenanceAlerts` y `getMaintenanceStatus` (`src/services/maintenanceAlerts.ts`) son funciones puras. Los umbrales son constantes con nombre (`CLEANING_THRESHOLD_HOURS = 150` y `THERMAL_PASTE_THRESHOLD_HOURS = 500`); HU-013 los hará configurables en el Sprint 4.
- **Pestaña Salud:**
  - aviso con el total de mantenimientos pendientes;
  - por consola, cada tipo con sus horas contra el umbral y una barra de avance, que pasa a ámbar al alcanzarlo;
  - «Registrar limpieza» o «Registrar pasta térmica», con confirmación.
- **Muro:** aviso pequeño «N mantenimientos pendientes» que lleva a Salud.
