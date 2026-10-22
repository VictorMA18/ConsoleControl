# Pruebas

Se usan Jest y React Native Testing Library.

## Qué debe cubrirse

- Cálculo de tiempo (`src/services/sessionTimer.ts`).
- Tarifas.
- Validaciones Zod.
- Repositorios, con base de datos en memoria si es posible.
- Componentes clave de la interfaz.

Las funciones de negocio reciben la hora como parámetro (`now = Date.now()`), así las pruebas fijan el instante sin simular relojes.

## Casos de la sesión

La prueba de T10 (servicio de cronómetro persistente) cubre los casos de la [sección 4 de la arquitectura](../architecture/arquitectura.md):

| Caso | Resultado esperado |
|---|---|
| Iniciar, cerrar la app 2 minutos y reabrir | El tiempo incluye esos 2 minutos |
| App 10 minutos en segundo plano | El cronómetro salta al valor correcto |
| Reinicio del celular con sesión activa | La sesión sigue `activa` con el tiempo correcto |
| Sesión sin internet | Se crea y cierra con `sync_status = 'pendiente'` |

## Nombres y ubicación

Los archivos de prueba se llaman `*.test.ts` o `*.test.tsx` y van dentro de `__tests__/`, con la misma estructura de carpetas que `src/`. Ejemplo: `__tests__/services/sessionTimer.test.ts`.

## Cómo ejecutarlas

`pnpm test` (se confirma en T02).
