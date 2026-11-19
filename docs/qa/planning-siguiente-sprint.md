# Planning del Sprint 2

| Campo             | Valor                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| Tarea             | T21 (TW-21) · TW-146                                                    |
| Fecha             | 18/11/2026                                                              |
| Fechas del sprint | 23/11 al 04/12/2026                                                     |
| Capacidad         | 40 h y unos 7 SP (ver [`velocidad-sprint-1.md`](velocidad-sprint-1.md)) |

Las fechas siguen el calendario del roadmap: el MVP sigue el 11/12/2026, después de este sprint y de la fase de pulido.

## Objetivo del sprint

Que el administrador pueda cerrar una sesión y cobrarla (HU-005), y dejar el proceso de revisión protegido.

## Compromiso

| Elemento                                                                                     | Horas estimadas | Responsable |
| -------------------------------------------------------------------------------------------- | --------------- | ----------- |
| Redactar los criterios Given-When-Then de HU-005 en `docs/specs/`                            | 3 h             | JS          |
| HU-005 · Lógica de liquidación (cierre, cobro con el motor de T13, liberar consola y mandos) | 10 h            | VM          |
| HU-005 · Botón "Cerrar sesión" en la tarjeta y resumen del cobro                             | 10 h            | RF          |
| HU-005 · Casos de prueba y pruebas automáticas                                               | 5 h             | VN          |
| Proteger `develop` y `main` (CI obligatorio y 1 aprobación)                                  | 1 h             | VN          |
| Pruebas de los repositorios con base SQLite real                                             | 6 h             | VM          |
| Evaluar notificaciones locales con la app cerrada (ADR nuevo)                                | 5 h             | VM          |
| **Total**                                                                                    | **40 h**        |             |

## Fuera del sprint

- HU-008 (respaldo con Supabase): pasa al siguiente sprint para no superar la capacidad.
- Formato de los `.md` y el cambio de `pnpm-lock.yaml`: tareas menores para cuando haya holgura.
