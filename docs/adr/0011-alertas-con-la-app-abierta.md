# ADR 0011 · Alertas de vencimiento con la app abierta

## Estado

Aceptada

## Fecha

18/11/2026

## Contexto

HU-004 pide que la tarjeta pase a ámbar titilante y el teléfono vibre cuando faltan 5 minutos. El spike de T10 (limitación L2) mostró que con la app en segundo plano o cerrada Android no ejecuta su código, así que no puede avisar a tiempo. La alternativa es programar notificaciones locales con `expo-notifications`.

## Decisión

En el MVP la alerta funciona con la app abierta en pantalla: ámbar titilante, vibración y un aviso escrito (T16). Al volver a la app, una sesión que venció se ve en "Tiempo cumplido" de inmediato y avisa una vez. Las notificaciones locales con la app cerrada se evalúan en una historia del siguiente sprint.

## Alternativas descartadas

- `expo-notifications` en el Sprint 1: suma una dependencia nueva, permisos de notificación y la reprogramación de avisos al extender o cerrar sesiones, sin tiempo para probarlo bien en el sprint.

## Consecuencias

- El celular del ciber debe quedar con la app abierta mientras hay sesiones de tiempo fijo.
- El tiempo y el cobro no se ven afectados: se calculan desde `started_at`.
- La vibración usa `Vibration` de React Native con el permiso `android.permission.VIBRATE` en `app.json`.
