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
- Texto base de 16 sp; nombre de consola de 24 sp; cronómetro de 36 sp con números tabulares.
- Fuente DM Sans y iconos de Lucide ([ADR 0014](../adr/0014-sistema-de-diseno-sala-de-control.md)).

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

## Sistema de diseño «sala de control»

Tema oscuro único, sin gradientes ni sombras de adorno (ADR 0014). El color se reserva para los estados de la consola; la acción principal es el botón marfil.

### Colores

Variables HSL en `global.css`, con los nombres de React Native Reusables, y los mismos valores en `src/utils/theme.ts`. Los componentes usan solo el nombre (`bg-card`, `text-muted-foreground`), nunca un color suelto.

| Token              | HSL           | Uso                                                     |
| ------------------ | ------------- | ------------------------------------------------------- |
| `background`       | `228 16% 7%`  | Fondo de las pantallas                                  |
| `card`             | `228 14% 11%` | Tarjetas y barras                                       |
| `raised`           | `228 12% 15%` | Superficie elevada dentro de una tarjeta                |
| `border`           | `228 11% 20%` | Bordes                                                  |
| `foreground`       | `40 18% 94%`  | Texto principal (16.8:1 sobre el fondo)                 |
| `muted-foreground` | `228 9% 66%`  | Texto atenuado (7.0:1 sobre la tarjeta)                 |
| `primary`          | `40 18% 94%`  | Botón principal y opción elegida (texto oscuro, 16.5:1) |
| `available`        | `152 58% 52%` | Disponible (8.4:1 sobre la tarjeta)                     |
| `playing`          | `5 82% 64%`   | En juego (5.5:1)                                        |
| `warning`          | `40 96% 56%`  | Por terminar y tiempo cumplido (9.6:1)                  |
| `pending`          | `199 88% 62%` | Por cobrar (8.2:1)                                      |

Cada estado tiene también su fondo suave (`available-soft`, `playing-soft`, `warning-soft`, `pending-soft`).

### Estados de la consola

| Estado          | Color | Icono         | Detalle                      |
| --------------- | ----- | ------------- | ---------------------------- |
| Disponible      | verde | `CircleCheck` | Mandos libres                |
| En juego        | coral | `Play`        | Cronómetro y avance          |
| Por terminar    | ámbar | `BellRing`    | Titila los últimos 5 minutos |
| Tiempo cumplido | ámbar | `TimerOff`    | Fijo hasta finalizar         |
| Por cobrar      | cian  | `Receipt`     | Tiempo detenido y total      |
| Mantenimiento   | gris  | `Wrench`      | Atenuada                     |

### Tipografía

DM Sans: 400 (texto), 500 (apoyo), 600 (botones), 700 y 800 (títulos, cifras). Etiquetas pequeñas en mayúsculas con 8 a 12 % de espaciado. Cronómetros e importes con números tabulares.

### Componentes y organización

- Base en `src/components/ui/` (`Text`, `Button`, `Card`, `Badge`, `Input`, `Icon`, copiados de React Native Reusables).
- `ScreenHeader` en todas las pantallas (marca en la principal; volver o cerrar en el resto), `Section` para agrupar, `StateView` para cargando, error y vacío, `ConfirmDialog` para confirmar, `StatusPill` para el estado y `Logo` para la marca.
- Navegación: pestañas Consolas y Caja (Salud en el Sprint 3). Cobro y herramientas de desarrollo se abren encima; el diálogo de sesión es un modal.
- Muro: logo y hora, resumen por estado, filtro por tipo y cuadrícula de dos columnas.
- Diálogos con acción principal: el botón queda fijo abajo con el margen de la barra de gestos.

## Medidas

| Elemento                      | Medida                                              |
| ----------------------------- | --------------------------------------------------- |
| Pantalla de referencia        | 360 × 800 dp                                        |
| Margen lateral                | 16 dp                                               |
| Separación entre tarjetas     | 12 dp                                               |
| Radio de tarjeta de consola   | 24 dp                                               |
| Radio de opciones y secciones | 16 y 24 dp                                          |
| Radio de botón                | 12 dp                                               |
| Zona táctil                   | 44 dp mínimo; opciones 56 dp; botón principal 64 dp |
| Barra de pestañas             | 68 dp                                               |

## Movimiento

Solo titila la franja "Por terminar" (opacidad de 1 a 0.35, 700 ms, alternada). Con movimiento reducido no titila. "Tiempo cumplido" queda en ámbar fijo.

## Revisión

Revisión con cliente simulado: VN, en el rol de propietario, recorrió el prototipo y validó el flujo de iniciar sesión en 2 toques, los colores y los mensajes. El detalle está en [`../qa/validacion-prototipo.md`](../qa/validacion-prototipo.md).
