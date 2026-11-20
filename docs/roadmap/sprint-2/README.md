# Sprint 2 · Cobro, caja y arqueo

| Campo            | Valor                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Fechas           | 26/10–6/11/2026                                                    |
| Historias        | HU-005, HU-006, HU-007 y HU-010 (20 puntos)                        |
| Método           | [`../metodo-de-trabajo.md`](../metodo-de-trabajo.md)               |
| Checklist manual | [`../../qa/checklist-sprint-2.md`](../../qa/checklist-sprint-2.md) |

## Objetivo

Que el administrador cierre una sesión, vea el resumen exacto de cobro, registre el pago (efectivo, Yape, Plin o fiado, incluso mixto), calcule el vuelto y cierre el turno comparando el efectivo contado contra lo registrado.

## Orden y avance

Las ramas van apiladas en este orden: cada una sale de la anterior.

| Parte                          | Historia             | Puntos | Rama                                           | Estado |
| ------------------------------ | -------------------- | ------ | ---------------------------------------------- | ------ |
| [01](01-hu-005-liquidacion.md) | HU-005 · Liquidación | 5      | `feature/HU-005-liquidacion` (desde `develop`) | ✔      |
| [02](02-hu-010-vuelto.md)      | HU-010 · Vuelto      | 2      | `feature/HU-010-vuelto` (sobre la 01)          | ✔      |
| [03](03-hu-006-cobro.md)       | HU-006 · Cobro       | 5      | `feature/HU-006-cobro` (sobre la 02)           | ✔      |
| [04](04-hu-007-arqueo.md)      | HU-007 · Arqueo      | 8      | `feature/HU-007-arqueo` (sobre la 03)          | ✔      |

## Al terminar el sprint

1. `pnpm test` una vez (salida recortada).
2. VN ejecuta el checklist en el celular.
3. Decisiones por defecto que VN debe confirmar: penalidad después de la gracia, cuándo el balance es "Conforme", fiado solo como método, apertura automática del turno, estado "por cobrar".

## Fuera de este sprint

HU-008 (sincronización) y HU-011 (fiados completos). La sincronización no se toca aquí.
