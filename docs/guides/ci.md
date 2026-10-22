# Integración continua

## Flujo previsto

En cada pull request, GitHub Actions ejecuta:

1. Instalar dependencias con pnpm (`pnpm install`).
2. `pnpm lint`.
3. `pnpm typecheck`.
4. `pnpm test`.

Los tres pasos deben pasar para fusionar. Se marcarán como verificación obligatoria en la protección de `develop` y `main`.

## Estado

El flujo está en `.github/workflows/ci.yml` (creado en T02). Falta marcarlo como verificación obligatoria en la protección de `develop` y `main`.

## Antes de abrir el pull request

Ejecuta los mismos comandos en local: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm exec prettier --check .`.
