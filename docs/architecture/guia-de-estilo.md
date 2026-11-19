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
- Texto base de 16 sp; nombre de consola de 24 sp; cronómetro de 28 sp con números tabulares.
- Fuente Montserrat Alternates e iconos de Lucide ([ADR 0014](../adr/0014-sistema-de-diseno-tarjeta-de-estado.md)).

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

## Sistema de diseño «tarjeta de estado»

Todo sale de la tarjeta de consola que diseñó VN ([ADR 0014](../adr/0014-sistema-de-diseno-tarjeta-de-estado.md)): franja de color con el estado, cuerpo claro, plataforma y nombre grandes, cronómetro con reloj y una columna de datos con icono separada por una línea vertical. Tema claro por defecto y oscuro opcional.

### Anatomía de la tarjeta de consola

```
┌──────────────────────────────────────────────┐
│ ✓ Disponible                     (franja)    │
├──────────────────────────────────────────────┤
│ ( PS logo PS3 )  PS3 #1   │ 🎮 2/6 mandos     │
│ ⏱ 00:12:05               │ ⏳ 47:55          │
│                           │ 🪙 S/ 6.00        │
├──────────────────────────────────────────────┤
│ ███████████░░░░░ avance del tiempo fijo      │
└──────────────────────────────────────────────┘
```

Columna derecha: mandos en uso sobre el total (libres si no hay sesión); tiempo restante, modalidad o «Libre»; total de la sesión o tarifa por hora si la consola está libre.

### Colores

Variables HSL en `global.css` (`:root` claro, `.dark:root` oscuro) con los nombres de React Native Reusables, y los mismos valores en `src/utils/theme.ts`. Los componentes usan solo el nombre (`bg-card`, `text-muted-foreground`), nunca un color suelto. Ningún token es blanco o negro puro.

| Token              | Claro         | Oscuro        | Uso                                   |
| ------------------ | ------------- | ------------- | ------------------------------------- |
| `background`       | `220 16% 95%` | `224 22% 8%`  | Fondo de las pantallas                |
| `card`             | `220 20% 99%` | `224 18% 12%` | Tarjetas y barras                     |
| `raised`           | `220 18% 96%` | `224 16% 15%` | Superficie dentro de una tarjeta      |
| `border`           | `220 14% 86%` | `224 14% 20%` | Bordes y divisores                    |
| `foreground`       | `226 44% 14%` | `220 20% 94%` | Texto principal (15:1 y 16:1)         |
| `muted-foreground` | `222 12% 40%` | `220 10% 66%` | Texto atenuado (6:1 y 7:1)            |
| `primary`          | `226 44% 14%` | `220 20% 94%` | Botón principal y opción elegida      |
| `available`        | `146 70% 29%` | `146 58% 30%` | Franja Disponible                     |
| `playing`          | `4 70% 45%`   | `4 62% 46%`   | Franja En juego                       |
| `warning`          | `36 92% 48%`  | `38 88% 54%`  | Franja Por terminar y Tiempo cumplido |
| `pending`          | `206 78% 38%` | `206 72% 38%` | Franja Por cobrar                     |
| `maintenance`      | `222 10% 44%` | `222 8% 38%`  | Franja Mantenimiento                  |

Cada estado tiene además `-foreground` (texto sobre la franja: marfil, o marino en ámbar), `-tone` (texto del estado sobre la tarjeta) y `-soft` (fondo de avisos). Todos los pares cumplen 4.5:1 como mínimo.

### Estados de la consola

| Estado          | Franja | Icono         | Detalle                      |
| --------------- | ------ | ------------- | ---------------------------- |
| Disponible      | verde  | `CircleCheck` | Mandos libres y tarifa       |
| En juego        | rojo   | `Play`        | Cronómetro y avance          |
| Por terminar    | ámbar  | `BellRing`    | Titila los últimos 5 minutos |
| Tiempo cumplido | ámbar  | `TimerOff`    | Fijo hasta finalizar         |
| Por cobrar      | azul   | `Receipt`     | Tiempo detenido y total      |
| Mantenimiento   | gris   | `Wrench`      | Atenuada                     |

### Tipografía

Montserrat Alternates: 500 (texto), 600 (pestañas), 700 (datos y botones) y 800 (estado, nombres y cifras). Títulos de sección en negrita, sin mayúsculas forzadas. Cronómetros e importes con números tabulares.

### Componentes y organización

- Base en `src/components/ui/` (`Text`, `Button`, `Card`, `Badge`, `Input`, `Icon`, copiados de React Native Reusables).
- Patrón de tarjeta: `ConsoleCard`, `PlatformBadge`, `InfoRow` y `PressableScale`. La misma franja de estado aparece en `WallSummary`, `SettlementSummary` y `ChangeCalculator`.
- `ScreenHeader` en todas las pantallas (marca en la principal; volver o cerrar en el resto), `Section` para agrupar, `StateView` para cargando, error y vacío, `ConfirmDialog` para confirmar, `StatusPill` para el estado en línea, `Logo` y `BrandMark` para la marca, `ThemeToggle` y `ThemeButton` para el tema.
- Navegación: pestañas Consolas y Caja (Salud en el Sprint 3). Cobro y herramientas de desarrollo se abren encima; el diálogo de sesión es un modal.
- Muro: logo, hora y botón de tema; resumen por estado; filtro por tipo; una columna de tarjetas anchas.
- Diálogos con acción principal: el botón queda fijo abajo y suma el margen de la barra del sistema.

### Ícono y pantalla de carga

Mando marfil sobre el verde de «Disponible». Fuentes en `assets/brand/*.svg`; los PNG de `assets/` se exportan de ahí (ícono, adaptativo de Android con su monocromo, pantalla de carga y favicon). La pantalla de carga usa fondo `#F0F2F4` (claro) o `#101219` (oscuro), que son `--background` en hexadecimal.

## Medidas

| Elemento                     | Medida                                              |
| ---------------------------- | --------------------------------------------------- |
| Pantalla de referencia       | 360 × 800 dp                                        |
| Margen lateral               | 16 dp                                               |
| Separación entre tarjetas    | 12 dp                                               |
| Radio de tarjeta y secciones | 24 dp                                               |
| Radio de botón               | 16 dp                                               |
| Pastilla de plataforma       | 40 dp de alto, radio completo                       |
| Zona táctil                  | 44 dp mínimo; opciones 56 dp; botón principal 64 dp |
| Barra de pestañas            | 62 dp más el margen inferior del sistema            |

## Movimiento

| Dónde                   | Movimiento                                                  |
| ----------------------- | ----------------------------------------------------------- |
| Cambio de pantalla      | Transición nativa de la plataforma                          |
| Diálogo de sesión       | Modal que sube desde abajo (nativo)                         |
| Pestañas                | Sin animación                                               |
| Tarjeta presionada      | Escala 0.97 en 120 ms                                       |
| Cambio de estado        | Color de la franja en 200 ms                                |
| Muro al filtrar         | Reacomodo en 220 ms y fundido de entrada en 200 ms          |
| Diálogo de confirmación | Entra de 0.96 a 1 con opacidad en 200 ms                    |
| Por terminar            | Titila la etiqueta (opacidad de 1 a 0.4, 700 ms, alternada) |
| Pantalla de carga       | Sale con un fundido de 250 ms                               |

Curva `cubicBezier(0.23, 1, 0.32, 1)`. Solo se animan `transform`, `opacity` y color. Con movimiento reducido no hay escala ni titileo: queda el cambio de opacidad o de color.

## Revisión

Revisión con cliente simulado: VN, en el rol de propietario, recorrió el prototipo y validó el flujo de iniciar sesión en 2 toques, los colores y los mensajes. El detalle está en [`../qa/validacion-prototipo.md`](../qa/validacion-prototipo.md).
