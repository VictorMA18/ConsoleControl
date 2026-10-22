# ADR 0006 · NativeWind

## Estado

Propuesta

## Fecha

21/10/2026

## Contexto

La interfaz necesita un sistema de estilos rápido de usar y consistente entre pantallas, con poco código propio.

## Decisión

Usar NativeWind (Tailwind para React Native) para los estilos.

## Alternativas descartadas

- React Native Paper: menos personalizable.
- StyleSheet con tokens propios: más código que mantener.

## Consecuencias

- Los estilos se escriben con clases en los componentes.
- El diseño de JS debe expresarse con la escala de Tailwind.
- La configuración se hace en T02.
