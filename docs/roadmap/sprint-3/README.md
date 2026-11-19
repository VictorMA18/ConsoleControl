# Sprint 3 · Sincronización, extensión de tiempo y mantenimiento

| Campo            | Valor                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Fechas           | 9–20/11/2026                                                       |
| Historias        | HU-008, HU-009, HU-012 y HU-014 (19 puntos)                        |
| Método           | [`../metodo-de-trabajo.md`](../metodo-de-trabajo.md)               |
| Checklist manual | [`../../qa/checklist-sprint-3.md`](../../qa/checklist-sprint-3.md) |

## Objetivo

Respaldar los datos en la nube cuando haya internet sin afectar el uso sin conexión, extender el tiempo de una sesión en curso, ver la salud de cada consola y mando y recibir alertas de mantenimiento preventivo.

## Orden y avance

Requiere el Sprint 2 fusionado en `develop`. HU-008 va al final porque sincroniza las tablas de todas las historias anteriores.

| Parte                                    | Historia                           | Puntos                | Rama                                                | Estado |
| ---------------------------------------- | ---------------------------------- | --------------------- | --------------------------------------------------- | ------ |
| [01](01-hu-009-extension-tiempo.md)      | HU-009 · Extensión de tiempo       | 3                     | `feature/HU-009-extension-tiempo` (desde `develop`) | ✔      |
| [02](02-hu-012-salud-equipos.md)         | HU-012 · Semáforo de salud         | 5                     | `feature/HU-012-semaforo-salud` (sobre la 01)       | ✔      |
| [03](03-hu-014-mantenimiento.md)         | HU-014 · Alerta de mantenimiento   | 3                     | `feature/HU-014-alerta-mantenimiento` (sobre la 02) | ✔      |
| [04](04-hu-008a-motor-sync.md)           | HU-008a · Motor de sincronización  | 8 en total (a, b y c) | `feature/HU-008-motor-sync` (sobre la 03)           | ✔      |
| [05](05-hu-008b-conectividad-ui.md)      | HU-008b · Conectividad e indicador |                       | `feature/HU-008-conectividad` (sobre la 04)         | ☐      |
| [06](06-hu-008c-supabase-entregables.md) | HU-008c · Supabase y entregables   |                       | `feature/HU-008-supabase` (sobre la 05)             | ☐      |

## Al terminar el sprint

1. `pnpm test` una vez (salida recortada).
2. VN ejecuta el checklist en el celular. Las comprobaciones con la nube real esperan a que exista el proyecto de Supabase.
3. Decisiones por confirmar: extender en "Tiempo cumplido", `averiado` en lugar de `defectuoso`, umbrales de mantenimiento, política de seguridad (RLS) de Supabase.

## Fuera de este sprint

HU-013 (parametrización) y HU-011 (fiados completos): Sprint 4. Los umbrales van como constantes con nombre. No se crea ningún proyecto de Supabase ni se usan credenciales que no se hayan entregado.
