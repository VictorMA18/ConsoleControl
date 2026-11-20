# Estilo de código

## Formato

- TypeScript estricto.
- Comillas simples, punto y coma, 2 espacios, máximo 100 caracteres por línea.
- Prettier aplica el formato (`.prettierrc`); ESLint lo exige con `prettier/prettier`.

## Capas y nombres

Las reglas de capas y de nombres están en [`AGENTS.md`](../../AGENTS.md), secciones 5 a 7. En resumen:

- Código en inglés; interfaz y documentos en español.
- Componentes en `PascalCase.tsx`; el resto en `camelCase.ts`; tablas y columnas en `snake_case`.
- Consultas solo en `src/db/repositories/`.
- No usar `any` sin un comentario que lo justifique (ESLint avisa con `warn`).

## ESLint

`.eslintrc.js` bloquea importar `expo-sqlite`, `drizzle-orm` y `drizzle-orm/*` fuera de `src/db/`, con el mensaje "Usa src/db/repositories; solo la capa de datos accede a SQLite." Dentro de `src/db/**/*.ts` la restricción está desactivada.

## Esquemas Zod compartidos

Cada entidad tiene su esquema en `src/schemas/`, con nombre en `camelCase.ts` (por ejemplo, `session.ts`). El mismo esquema se usa en el formulario y en el servicio:

```ts
// src/schemas/session.ts
import { z } from 'zod';

export const newSessionSchema = z.object({
  consoleId: z.number().int().positive(),
  durationMs: z.number().int().positive(),
});

export type NewSession = z.infer<typeof newSessionSchema>;
```

El tipo se obtiene con `z.infer`; no se escribe a mano.

## Zustand y TanStack Query

| Usa | Cuándo |
|---|---|
| Zustand (`src/stores/`) | Estado de pantalla: filtros, selección, paneles abiertos |
| TanStack Query (`src/hooks/`) | Todo dato que viene de SQLite o se escribe en SQLite, y la sincronización |

Los datos de negocio nunca se guardan en Zustand.
