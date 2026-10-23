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

Ya está incluido en el repositorio; no es necesario crearlo al clonar.

## Correr el proyecto

Desde la raíz del proyecto:

```bash
pnpm install
pnpm start
```

Los pasos de instalación, ejecución en emulador y celular, solución de problemas y
verificación de los cuatro integrantes están en el [README](../../README.md).
