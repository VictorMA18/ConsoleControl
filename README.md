# ConsoleControl Mobile

App móvil offline-first para controlar el alquiler de consolas en un ciber. Reemplaza el cuaderno con el que hoy se controlan los tiempos de juego, los cobros y el mantenimiento.

Antes de cambiar código lee [`AGENTS.md`](AGENTS.md). La documentación completa está en [`docs/`](docs/README.md).

## Requisitos

- Node LTS.
- pnpm (`npm install -g pnpm`).
- Git.
- Expo Go en el celular, o un emulador de Android.

## Ejecutar

```bash
pnpm install
pnpm start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iOS). El celular y la computadora deben estar en la misma red.

## Comandos

| Comando          | Para qué                        |
| ---------------- | ------------------------------- |
| `pnpm start`     | Iniciar Expo                    |
| `pnpm android`   | Abrir en un emulador de Android |
| `pnpm lint`      | ESLint                          |
| `pnpm typecheck` | Verificar tipos de TypeScript   |
| `pnpm test`      | Pruebas con Jest                |
| `pnpm format`    | Aplicar Prettier                |

Antes de abrir un pull request deben pasar `pnpm lint`, `pnpm typecheck` y `pnpm test`. El flujo de ramas está en [`docs/guides/flujo-git.md`](docs/guides/flujo-git.md).
