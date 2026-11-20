# Entorno de trabajo

## Requisitos

- Node LTS.
- pnpm.
- Expo Go en un celular, o un emulador.
- Git.

No se fijan números de versión: usar la versión compatible con el SDK de Expo vigente.

## Configuración de pnpm

Expo exige que pnpm instale las dependencias de forma plana. El archivo `.npmrc` de la raíz debe contener:

```
node-linker=hoisted
```

Se crea en T02, junto con el proyecto.

## Correr el proyecto

Cuando exista el proyecto Expo (T02):

```bash
pnpm install
pnpm start
```

Después abre la app con Expo Go o con el emulador. Los comandos se confirman en T02.
