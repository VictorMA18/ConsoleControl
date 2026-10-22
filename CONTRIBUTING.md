# Guía de contribución

El detalle está en [`docs/guides/flujo-git.md`](docs/guides/flujo-git.md) y [`docs/guides/estilo-codigo.md`](docs/guides/estilo-codigo.md).

## Ramas

- `main`: estable, solo por pull request desde `develop`.
- `develop`: integración, solo por pull request desde una feature.
- `feature/T0X-nombre`: una por tarea.

## Commits

Formato: `tipo(T0X): descripción en minúsculas y en presente`

Ejemplo: `feat(T10): calcular tiempo transcurrido desde started_at`

## Antes de abrir el pull request

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm exec prettier --check .
```

Los cuatro comandos deben terminar sin errores.

## Después de fusionar

Borra la rama de la feature (en GitHub se borra sola si está activada la opción "Automatically delete head branches"). Nunca borres `main` ni `develop`. Detalle en [`docs/guides/flujo-git.md`](docs/guides/flujo-git.md).
