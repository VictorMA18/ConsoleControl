# Parte 05 · HU-008b Conectividad e indicador (de 8 puntos de HU-008)

Rama: `feature/HU-008-conectividad`, sobre la rama de la parte 04. Criterios Given-When-Then: ver la [parte 04](04-hu-008a-motor-sync.md).

## Trabajo

1. **ADR 0015** en `docs/adr/`: elegir `@react-native-community/netinfo` o `expo-network` (AGENTS §7: ninguna dependencia fuera del stack sin ADR). Instalar con `pnpm`, no antes del ADR.
2. `src/sync/connectivity.ts`: monitor de conectividad que dispara la sincronización al recuperar conexión, al volver la app a primer plano y cada cierto intervalo.
3. Store de Zustand en `src/stores/` con el estado de sincronización (sin conexión, pendiente con N registros, nube actualizada).
4. Indicador simple en la cabecera del muro: "Sin conexión", "Pendiente (N)" o "Nube actualizada" (texto o icono pequeño; no hay boceto).
5. La sincronización corre aparte y **nunca bloquea la interfaz** (RN-09): sin internet el motor espera.

## Pruebas

Ninguna nueva: la lógica probable ya está en la parte 04.

## Hecho cuando

El indicador refleja el estado y la sincronización se dispara sola. Lint y typecheck en verde.
