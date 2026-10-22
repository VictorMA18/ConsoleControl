# Documentación de ConsoleControl Mobile

Punto de entrada para agentes y personas: [`../AGENTS.md`](../AGENTS.md).

| Carpeta | Qué contiene | Cuándo leerla |
|---|---|---|
| [`architecture/`](architecture/arquitectura.md) | Capas, estructura de carpetas y decisión sobre el tiempo de sesiones | Antes de crear o mover un archivo |
| [`adr/`](adr/0000-plantilla.md) | Registro de decisiones técnicas, una por archivo | Para saber por qué se eligió algo o proponer un cambio |
| [`roadmap/`](roadmap/README.md) | Fases del proyecto hasta el MVP | Para saber qué toca ahora y qué viene |
| [`guides/`](guides/flujo-git.md) | Flujo de git, estilo, pruebas, CI y entorno | Al trabajar, revisar o preparar el equipo |
| [`specs/`](specs/README.md) | Historias de usuario con criterios Given-When-Then | Al empezar o probar una historia |

Decisiones técnicas registradas:

| ADR | Decisión |
|---|---|
| [0001](adr/0001-expo-react-native.md) | Expo con React Native y TypeScript |
| [0002](adr/0002-sqlite-fuente-de-verdad.md) | SQLite como fuente de verdad |
| [0003](adr/0003-hora-de-inicio-persistida.md) | Hora de inicio persistida |
| [0004](adr/0004-drizzle-orm.md) | Drizzle ORM |
| [0005](adr/0005-estado-zustand-tanstack-query.md) | Zustand y TanStack Query |
| [0006](adr/0006-nativewind.md) | NativeWind |
| [0007](adr/0007-zod-react-hook-form.md) | Zod con React Hook Form |
| [0008](adr/0008-supabase-respaldo-unidireccional.md) | Respaldo unidireccional con Supabase |
| [0009](adr/0009-sin-login-en-el-mvp.md) | Sin login en el MVP |

Regla: una decisión por ADR, una fase por archivo de roadmap, una historia de usuario por archivo de `specs/`.
