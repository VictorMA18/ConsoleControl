# Guía de estilo y prototipo

| Campo                 | Valor                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tarea                 | T04 (TW-4) · TW-45 a TW-53                                                                                                |
| Fecha                 | 18/11/2026                                                                                                                |
| Prototipo             | [Figma · ConsoleControl Mobile · Prototipo Sprint 1](https://www.figma.com/design/EtdgGoBGjWA9zN4lmK4wYU)                 |
| Prototipo interactivo | [Flujo «Iniciar una sesión»](https://www.figma.com/proto/EtdgGoBGjWA9zN4lmK4wYU?node-id=3-2&starting-point-node-id=3%3A2) |
| Implementación        | `global.css`, `tailwind.config.js`, `src/components/`                                                                     |

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

Desde el [ADR 0012](../adr/0012-react-native-reusables-y-colores-hsl.md) los colores son variables HSL en `global.css`, con los nombres de React Native Reusables. Los valores hexadecimales de abajo son los del prototipo de Figma (`color/*`) y equivalen a los HSL. Los componentes usan solo el nombre del token (`bg-primary`, `text-foreground`), nunca un color suelto.

| Token                | Hex (Figma) | HSL                 | Uso                                                     |
| -------------------- | ----------- | ------------------- | ------------------------------------------------------- |
| `background`         | `#F1F5F9`   | `210 40% 96.1%`     | Fondo de las pantallas                                  |
| `card`               | `#FFFFFF`   | `0 0% 100%`         | Tarjetas, barras y diálogos                             |
| `foreground`         | `#0F172A`   | `222.2 47.4% 11.2%` | Texto principal                                         |
| `muted-foreground`   | `#475569`   | `215.3 19.3% 34.5%` | Texto secundario (6.92:1 sobre el fondo)                |
| `border`             | `#CBD5E1`   | `212.7 26.8% 83.9%` | Bordes                                                  |
| `primary`            | `#0369A1`   | `201.3 96.3% 32.2%` | Botón principal y opción elegida (texto blanco, 5.93:1) |
| `secondary`          | `#E2E8F0`   | `214.3 31.8% 91.4%` | Fondos secundarios (total estimado)                     |
| `available`          | `#15803D`   | `142.4 71.8% 29.2%` | Franja "Disponible" (texto blanco, 5.02:1)              |
| `playing`            | `#B91C1C`   | `0 73.7% 41.8%`     | Franja "En juego" (texto blanco, 6.46:1)                |
| `warning`            | `#F59E0B`   | `37.7 92.1% 50.2%`  | Franja "Por terminar" y "Tiempo cumplido"               |
| `warning-foreground` | `#451A03`   | `20.9 91.7% 14.1%`  | Texto sobre ámbar (6.98:1)                              |
| `playing-soft`       | `#FEE2E2`   | `0 93.3% 94.1%`     | Fondo de mensajes de error                              |

Los equivalentes anteriores eran `canvas`, `surface`, `ink`, `muted`, `line` y `warning-ink`. Los mismos valores están en `src/utils/theme.ts` para lo que no acepta `className`.

## Componentes y organización

- Base común en `src/components/ui/` (`Text`, `Button`, `Card`, `Badge`, copiados de React Native Reusables).
- `StateView` muestra cargando, error y vacío con el mismo aspecto en todas las pantallas.
- Muro: resumen de consolas libres y en juego (`WallSummary`), filtro por tipo y cuadrícula de tarjetas.
- Diálogos con acción principal: el botón queda fijo abajo (con el margen de la barra de gestos) y las opciones van agrupadas en tarjetas.

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
