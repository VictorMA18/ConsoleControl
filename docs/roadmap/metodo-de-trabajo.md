# Método de trabajo de los sprints 2 y siguientes

Reglas comunes. Cada parte de `sprint-N/` las da por leídas y no las repite. Lee este archivo y solo la parte que toca.

## Cómo avanzar parte por parte

1. `git fetch` y crea la rama desde `develop` (o apilada sobre la rama anterior, si la parte lo indica).
2. Lee solo esta guía y el archivo de la parte. No abras los demás.
3. Programa. Si falta un dato, escribe `Por confirmar` en el código o en la parte y avisa a VN; no inventes reglas, tarifas ni montos.
4. Verifica **solo** con `pnpm lint` y `pnpm typecheck`.
5. Commit en español, push y `gh pr create` hacia `develop`. No fusiones ni aprobes tu propia PR.
6. Marca la parte como hecha (✔) en el README del sprint.

## Pruebas

- Mientras se desarrolla: solo lint y typecheck. No uses emulador, `adb`, EAS ni la suite completa.
- Cada parte pide unas pocas pruebas de **lógica pura** (las más importantes). Se escriben junto con la parte, en `__tests__/` espejo de `src/`, pero no se ejecutan hasta el final del sprint.
- Al terminar el sprint se ejecuta `pnpm test` una sola vez (salida recortada) y VN hace el checklist en el celular (`docs/qa/checklist-sprint-N.md`).
- Jest no abre SQLite: las pruebas no importan nada que abra la base. La lógica que hay que probar va en funciones puras que reciben todo por parámetro (incluida la hora).
- Si una prueba falla porque el código está mal, se arregla el código. Nunca se cambia la aserción ni se usa `skip`.

## Reglas de código

- Código en inglés; interfaz, documentos y commits en español ([AGENTS.md](../../AGENTS.md)).
- Capas: Interfaz → Lógica → Acceso a datos → SQLite. Ningún SQL fuera de `src/db/`.
- Dinero siempre en **céntimos enteros** (como `total_cents`). Nunca decimales.
- Tablas nuevas en inglés y snake_case, con `id` UUID (`expo-crypto`) y `...controlColumns` (`src/db/schema/controlColumns.ts`), que ya trae `created_at`, `updated_at` y `sync_status`.
- Todo cambio de esquema es una **migración nueva** (`pnpm db:generate`); nunca se edita una existente.
- Todo funciona sin internet. Ninguna llamada remota fuera de `src/sync/`.
- Zod en los límites, React Hook Form en formularios, Zustand solo para estado de pantalla, TanStack Query para datos. Ninguna librería nueva sin ADR.

## Pantallas nuevas (para no rehacer el trabajo después)

- Usa solo los tokens de `tailwind.config.js` (nada de colores sueltos): si luego se pasa a HSL, el cambio será en un solo sitio.
- Haz componentes pequeños y aislados en `src/components/`, sin lógica de datos dentro: así se pueden reemplazar por React Native Reusables más adelante ([ideas pendientes](mejoras-pendientes.md)).
- Reutiliza `ChoiceButton`, `ConsoleCard`, `formatMoney` y las clases del muro de consolas; no hay bocetos nuevos.

## Git y PR

- Ramas `feature/HU-0XX-nombre` y commits `tipo(HU-0XX): descripción` en minúsculas y en presente.
- Un PR por parte hacia `develop`. Cuerpo corto: qué cambia, decisiones por defecto a confirmar, salida de lint y typecheck y qué falta. Campo Jira: "pendiente" (las tareas se crean después).
- Cada commit termina con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` y cada PR con el pie `Generated with Claude Code`.

## Límites

- No cambiar la pila tecnológica ni la estructura de `AGENTS.md`.
- No tocar Jira ni Figma por ahora.
- No modificar el código ni las pruebas de HU-001 a HU-004, salvo el cambio mínimo que pida una parte (y avisarlo en la PR).
- No crear recursos en la nube ni usar credenciales que no se hayan entregado.
