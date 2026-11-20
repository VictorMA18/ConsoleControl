# ADR 0003 · Hora de inicio persistida

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

Un contador en memoria se pierde si se cierra la app, el sistema la detiene o el celular se reinicia, y eso causa cobros incorrectos.

## Decisión

Guardar `started_at` (milisegundos Unix) y estado `activa` en SQLite al iniciar la sesión. El tiempo transcurrido se calcula siempre como `ahora − started_at` y nunca se guarda como contador. Detalle en la [sección 4 de la arquitectura](../architecture/arquitectura.md).

## Alternativas descartadas

- Contador en memoria: se pierde al cerrar la app y cobraría mal.

## Consecuencias

- Las funciones de tiempo reciben la hora como parámetro y son fáciles de probar.
- Si alguien cambia la hora del celular, el cálculo cambia. Se acepta en el MVP y se revisa al hacer la sincronización.
