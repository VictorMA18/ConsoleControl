# Guía de estilo y prototipo

| Campo                 | Valor                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tarea                 | T04 (TW-4) · TW-45 a TW-53                                                                                                |
| Fecha                 | 18/11/2026                                                                                                                |
| Prototipo             | [Figma · ConsoleControl Mobile · Prototipo Sprint 1](https://www.figma.com/design/EtdgGoBGjWA9zN4lmK4wYU)                 |
| Prototipo interactivo | [Flujo «Iniciar una sesión»](https://www.figma.com/proto/EtdgGoBGjWA9zN4lmK4wYU?node-id=3-2&starting-point-node-id=3%3A2) |
| Implementación        | `tailwind.config.js`, `src/components/`                                                                                   |

## Principios

La app es un espejo del cuaderno del ciber: una pantalla principal con todas las consolas, botones grandes y alto contraste, y un máximo de 2 toques para iniciar una sesión (RNF-02).

- Cada estado se indica con color **y** etiqueta, nunca solo con color.
- Áreas táctiles de al menos 48 dp; las opciones del diálogo, 56 dp; el botón principal, 64 dp.
- Texto base de 16 sp; títulos de tarjeta de 24 sp; cronómetro de 30 sp con números tabulares.
- Fuente del sistema (Roboto en Android).

## Pantallas del prototipo

| #   | Pantalla                 | Qué muestra                                                                               |
| --- | ------------------------ | ----------------------------------------------------------------------------------------- |
| 1   | Muro de consolas         | Cuadrícula de 2 columnas con una tarjeta por consola y filtro por tipo                    |
| 2   | Diálogo de sesión        | Mandos 1 a 6, modalidad, total estimado y "Iniciar sesión" (1 mando y 1 hora por defecto) |
| 3   | Muro con sesión en juego | Tarjeta roja con cronómetro y tiempo restante                                             |
| 4   | Alerta: por terminar     | Tarjeta en ámbar titilante y aviso "faltan 5 minutos"                                     |
| 5   | Tiempo cumplido          | Tarjeta en ámbar fijo hasta la liquidación                                                |
| 6   | Mandos insuficientes     | Motivo y consolas alternativas con stock                                                  |
| 7   | Consola ocupada          | Motivo del bloqueo y "Volver al muro"                                                     |

Flujo enlazado: 1 → 2 → 3 → 4 → 5 → 7; desde 1, tocar PS4 con 5 mandos lleva a 6, y una alternativa vuelve a 2.

## Colores

Los mismos valores están en las variables de Figma (`color/*`) y en `tailwind.config.js`.

| Token          | Hex       | Uso                                                             |
| -------------- | --------- | --------------------------------------------------------------- |
| `canvas`       | `#F1F5F9` | Fondo del muro                                                  |
| `surface`      | `#FFFFFF` | Tarjetas, diálogo                                               |
| `ink`          | `#0F172A` | Texto principal                                                 |
| `muted`        | `#475569` | Texto secundario                                                |
| `line`         | `#CBD5E1` | Bordes                                                          |
| `primary`      | `#0369A1` | Botón principal y opción elegida                                |
| `available`    | `#15803D` | Franja "Disponible" (texto blanco, 5.02:1)                      |
| `playing`      | `#B91C1C` | Franja "En juego" (texto blanco, 6.47:1)                        |
| `warning`      | `#F59E0B` | Franja "Por terminar" y "Tiempo cumplido" (texto `warning-ink`) |
| `warning-ink`  | `#451A03` | Texto sobre ámbar (6.97:1)                                      |
| `playing-soft` | `#FEE2E2` | Fondo de mensajes de error                                      |

## Medidas

| Elemento                  | Medida                                               |
| ------------------------- | ---------------------------------------------------- |
| Pantalla de referencia    | 360 × 800 dp                                         |
| Margen lateral            | 16 dp                                                |
| Separación entre tarjetas | 12 dp                                                |
| Radio de tarjeta          | 16 dp                                                |
| Radio de opción y botón   | 12 dp                                                |
| Franja de estado          | 8 dp vertical, 16 dp horizontal, texto 16 sp negrita |
| Chip de filtro            | 48 dp de alto, radio 24 dp                           |

## Movimiento

Solo titila la franja "Por terminar" (opacidad de 1 a 0.35, 700 ms, alternada). Con movimiento reducido no titila. "Tiempo cumplido" queda en ámbar fijo.

## Revisión

Revisión con cliente simulado: VN, en el rol de propietario, recorrió el prototipo y validó el flujo de iniciar sesión en 2 toques, los colores y los mensajes. El detalle está en [`../qa/validacion-prototipo.md`](../qa/validacion-prototipo.md).
