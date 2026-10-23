# AGENTS.md

Guía principal para agentes de código y personas nuevas en ConsoleControl Mobile. El detalle está en `docs/`.

## 1. Qué es el proyecto

ConsoleControl Mobile es una app móvil offline-first para controlar el alquiler de consolas (PS4, PS5, Xbox, Switch) en un ciber. Funciona sin internet. SQLite en el dispositivo es la fuente de verdad. Supabase es solo un respaldo.

Fechas: Sprint 1 del 12 al 23/10/2026. MVP el 11/12/2026.

## 2. Estado actual

- Fase vigente: Fase 0, Fundación (Sprint 1). Roadmap en [`docs/roadmap/README.md`](docs/roadmap/README.md).
- Proyecto Expo inicializado en T02 (SDK 58, Expo Router). La base de datos se agrega en T03.

## 3. Equipo y áreas

| Sigla | Rol | Áreas |
|---|---|---|
| JS | UI/UX y análisis | Diseño y criterios de aceptación |
| RF | Frontend | `app/`, `src/components/`, `src/hooks/` |
| VM | Backend y base de datos | `src/db/`, `src/services/`, `src/sync/` |
| VN | Arquitectura y jefe de proyecto | `docs/`, `.github/` y la configuración de la raíz |

## 4. Tecnologías

| Área | Decisión | Para qué se usa en este proyecto |
|---|---|---|
| Framework | React Native con Expo y TypeScript estricto; Expo Router | App móvil y navegación entre pantallas |
| Gestor de paquetes | pnpm (`node-linker=hoisted` en `.npmrc`) | Instalar dependencias; el ajuste lo exige Expo |
| Base de datos local | SQLite con `expo-sqlite` | Guardar sesiones, consolas, mandos y tarifas |
| Acceso a datos | Drizzle ORM y `drizzle-kit` | Consultas tipadas, esquema y migraciones |
| Validación | Zod | Validar formularios y datos antes de guardar |
| Formularios | React Hook Form con `@hookform/resolvers/zod` | Formularios con el mismo esquema Zod |
| Estado de interfaz | Zustand | Filtros, selección y estado de pantalla |
| Estado de datos | TanStack Query | Leer y escribir SQLite y sincronizar |
| Estilos | NativeWind | Estilos con clases de Tailwind |
| Respaldo en la nube | Supabase, solo dispositivo → nube (HU-008) | Copia de los registros pendientes |
| Pruebas | Jest y React Native Testing Library | Cobertura de tiempo, tarifas y validaciones |
| Calidad | ESLint, Prettier, `tsc --noEmit` y pruebas en GitHub Actions | Verificar cada pull request |
| Usuarios | Sin login en el MVP | Un operador por dispositivo (O1) |

## 5. Arquitectura en pocas líneas

Cuatro capas: Interfaz → Lógica de negocio → Acceso a datos → SQLite. Los servicios en segundo plano (`src/sync/`) usan el Acceso a datos y suben a Supabase cuando hay internet.

```
app/                  Pantallas (Expo Router)
src/components/       Componentes de interfaz
src/hooks/            Hooks de React y de TanStack Query
src/stores/           Stores de Zustand (solo estado de interfaz)
src/services/         Lógica de negocio
src/schemas/          Esquemas Zod compartidos
src/db/               schema/, migrations/, repositories/, client.ts, seed.ts
src/sync/             Sincronización con Supabase (HU-008)
src/utils/            Funciones auxiliares sin estado
src/types/            Tipos de TypeScript
__tests__/            Pruebas
```

Regla de dependencias: la Interfaz usa la Lógica, la Lógica usa el Acceso a datos, el Acceso a datos usa SQLite. Nunca en sentido contrario. Detalle en [`docs/architecture/arquitectura.md`](docs/architecture/arquitectura.md).

## 6. Reglas de código

- Código (variables, funciones, tipos, tablas, columnas) en inglés. Interfaz y documentos en español.
- Componentes en `PascalCase.tsx`; el resto en `camelCase.ts`; tablas y columnas en `snake_case`.
- Fechas como milisegundos Unix.
- Validar con Zod en los límites: formularios y antes de escribir en SQLite.
- Consultas con Drizzle solo en `src/db/`.
- TanStack Query para leer y escribir datos desde la interfaz.
- Zustand solo para estado de pantalla.

## 7. Qué NO hacer

- No importar `expo-sqlite` ni `drizzle-orm` fuera de `src/db/`: la capa de datos es la única que conoce el almacenamiento.
- No escribir SQL ni consultas fuera de `src/db/repositories/`: un solo lugar facilita cambios y pruebas.
- No guardar el tiempo transcurrido de una sesión ni calcularlo con un contador en memoria: se calcula siempre como `ahora − started_at`.
- No hacer que una función de negocio dependa de internet: todo debe funcionar sin conexión.
- No usar AsyncStorage para datos de negocio: van en SQLite.
- No guardar datos de negocio en Zustand: ahí solo va estado de interfaz.
- No usar `any` sin un comentario que lo justifique: pierde las garantías de tipos.
- No agregar dependencias fuera del stack sin un ADR aprobado (incluidas librerías de fechas, de estado y de UI): evita crecimiento sin control.
- No agregar login, usuarios ni roles en el MVP (Observación O1): el cliente opera solo el ciber.
- No implementar sincronización en dos sentidos: es solo dispositivo → nube y así no hay conflictos.
- No editar una migración ya fusionada a `develop`: se crea una nueva para no romper bases existentes.
- No subir secretos ni archivos `.env` (claves de Supabase incluidas): el repositorio es compartido.
- No hacer push directo a `main` ni a `develop`, ni usar `--force`: todo cambio pasa por revisión.
- No fusionar tu propio pull request: la revisión la hace otra persona.
- No inventar historias de usuario ni criterios de aceptación: la fuente es el backlog y `docs/specs/`.

## 8. Comandos

| Comando | Para qué |
|---|---|
| `pnpm install` | Instalar dependencias |
| `pnpm start` | Iniciar Expo |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Jest |
| `pnpm format` | Aplicar Prettier |
| `pnpm db:generate` | Generar migraciones con drizzle-kit en `src/db/migrations/` |

## 9. Dónde buscar

| Si te piden | Lee |
|---|---|
| Entender la arquitectura o dónde va un archivo | [`docs/architecture/arquitectura.md`](docs/architecture/arquitectura.md) |
| Tablas, columnas o relaciones de la base de datos | [`docs/architecture/base-de-datos.md`](docs/architecture/base-de-datos.md) |
| Saber por qué se eligió una tecnología | [`docs/adr/`](docs/adr/) (un archivo por decisión) |
| Saber qué toca hacer ahora o qué viene | [`docs/roadmap/README.md`](docs/roadmap/README.md) y la fase vigente |
| Ramas, commits o pull requests | [`docs/guides/flujo-git.md`](docs/guides/flujo-git.md) y [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Estilo de código, ESLint, Prettier | [`docs/guides/estilo-codigo.md`](docs/guides/estilo-codigo.md) |
| Escribir o ejecutar pruebas | [`docs/guides/pruebas.md`](docs/guides/pruebas.md) |
| Verificaciones automáticas | [`docs/guides/ci.md`](docs/guides/ci.md) |
| Preparar el entorno de trabajo | [`docs/guides/entorno.md`](docs/guides/entorno.md) |
| Requisitos o criterios de una historia | [`docs/specs/`](docs/specs/) |
| Una tarea concreta | Jira, proyecto TW: la tarea Tn es TW-n (T01 = TW-1, …, T21 = TW-21) |

**Cuando se te pida explorar o modificar un archivo o una parte del código, primero consulta esta tabla y lee el documento correspondiente antes de abrir el código.**

## 10. Observaciones y decisiones abiertas

- **O1 (usuarios).** El MVP no tiene login ni roles: el cliente es una persona mayor de edad que opera el ciber directamente. Puede cambiar después (PIN local o Supabase Auth). No agregues columnas ni pantallas de usuario ahora, pero no acoples la lógica a la idea de un único usuario (por ejemplo, no uses datos globales sueltos para identificar al operador). Ver [ADR 0009](docs/adr/0009-sin-login-en-el-mvp.md).
- Historias de las fases 1 y 2: por definir con el backlog.
- Nombres de las tareas T07 a T09, T11 a T16 y T20: por definir (no constan en las instrucciones de T01).

## 11. Cómo mantener este archivo

Se actualiza en el mismo pull request que cambie una decisión o convención. Las decisiones nuevas se registran como ADR en `docs/adr/`.
