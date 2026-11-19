# Parte 03 · HU-014 Alerta de mantenimiento preventivo (3 puntos)

Rama: `feature/HU-014-alerta-mantenimiento`, sobre la rama de la parte 02. Ficha: `docs/specs/hu-014-alerta-mantenimiento.md`.

**Como** propietario del ciber, **quiero** recibir una alerta cuando una consola alcance un umbral de horas de uso, **para** programar limpieza o cambio de pasta térmica antes de que falle.
Dependencias técnicas: HU-012. Casos de uso y reglas: CU-004, RF-11.

## Criterios de aceptación (Given-When-Then)

- DADO QUE una consola acumula horas de uso con cada sesión cobrada,
- CUANDO alcanza el umbral configurado (por ejemplo, 150 h para limpieza o 500 h para pasta térmica),
- ENTONCES el sistema muestra una alerta de mantenimiento y reinicia el contador al registrarse la intervención.

## Trabajo

- **Datos (migración nueva):** tabla `maintenances` (consola, tipo `limpieza` o `pasta_termica`, horas de uso acumuladas en ese momento).
- **Contador:** **no borres ni pongas a cero las horas de uso.** Las horas desde la última intervención = horas acumuladas − horas registradas en la última intervención de ese tipo.
- **Lógica:** función pura `getMaintenanceAlerts(consoles, maintenances, thresholds)`. Umbrales (150 h limpieza, 500 h pasta térmica) como constantes con nombre; HU-013 las hará configurables en el Sprint 4.
- **Interfaz:** alerta visible en la pantalla `app/salud/` (y un aviso pequeño en el muro) y acción "Registrar mantenimiento" que guarda la intervención y quita la alerta.

## Pruebas (lógica pura, `__tests__/services/maintenanceAlerts.test.ts`)

1. Bajo el umbral no hay alerta; al llegar a 150 h desde la última limpieza, alerta de limpieza.
2. Tras registrar la limpieza, las horas desde la última intervención vuelven a cero y la alerta desaparece, sin perder las horas acumuladas.

## Hecho cuando

La alerta aparece al alcanzar el umbral, se limpia al registrar la intervención sin perder historial y las 2 pruebas están escritas. Lint y typecheck en verde.
