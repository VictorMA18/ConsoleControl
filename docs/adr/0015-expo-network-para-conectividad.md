# ADR 0015 · expo-network para detectar la conexión

## Estado

Aceptada

## Fecha

19/11/2026

## Contexto

La sincronización (HU-008) debe arrancar sola al recuperar internet y esperar sin errores cuando no lo hay (RN-09). El stack de AGENTS.md no incluye una librería de conectividad; las opciones son `@react-native-community/netinfo` y `expo-network`. Las dos vienen incluidas en Expo Go para el SDK 58.

## Decisión

Usar `expo-network`, instalado con `npx expo install`. Se usa `getNetworkStateAsync` al arrancar y `addNetworkStateListener` para enterarse de los cambios. Hay conexión cuando `isConnected` y `isInternetReachable` no son `false`.

## Alternativas descartadas

- `@react-native-community/netinfo`: da más detalle (tipo de red, intensidad), que la app no necesita. Es otra dependencia de la comunidad con su propio ciclo de versiones; `expo-network` es del SDK de Expo y se actualiza junto con él.

## Consecuencias

- Solo `src/sync/connectivity.ts` importa `expo-network`; el resto de la app lee el estado desde el store de sincronización.
- La detección es orientativa: si el sistema dice que hay red pero la nube no responde, el motor falla sin lanzar y reintenta (5 s, 15 s, 60 s).
