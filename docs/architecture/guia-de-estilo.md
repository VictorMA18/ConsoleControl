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
│ ( PS logo PS3 )  MAQ #1   │ 🎮 2/6 mandos     │
│ ⏱ 00:12:05               │ ⏳ 47:55          │
│                           │ 🪙 S/ 6.00        │
├──────────────────────────────────────────────┤
│ ███████████░░░░░ avance del tiempo fijo      │
└──────────────────────────────────────────────┘
```

Las máquinas se llaman «MAQ #n»; el tipo se ve en la pastilla (logo de PlayStation, Xbox o Switch). El buscador del muro encuentra una máquina por su número.

Columna derecha: mandos en uso sobre el total (libres si no hay sesión); tiempo restante, modalidad o «Libre»; total de la sesión o tarifa por hora si la consola está libre.

### Colores

Variables HSL en `global.css` (`:root` claro, `.dark:root` oscuro) con los nombres de React Native Reusables, y los mismos valores en `src/utils/theme.ts`. Los componentes usan solo el nombre (`bg-card`, `text-muted-foreground`), nunca un color suelto. Ningún token es blanco o negro puro.

| Token              | Claro         | Oscuro         | Uso                                   |
| ------------------ | ------------- | -------------- | ------------------------------------- |
| `background`       | `220 16% 95%` | `225 8% 8%`    | Fondo de las pantallas                |
| `card`             | `220 20% 99%` | `225 7% 11.5%` | Tarjetas y barras                     |
| `raised`           | `220 18% 96%` | `225 6% 15%`   | Superficie dentro de una tarjeta      |
| `border`           | `220 14% 86%` | `225 6% 20%`   | Bordes y divisores                    |
| `foreground`       | `226 44% 14%` | `220 12% 93%`  | Texto principal (15:1 y 16:1)         |
| `muted-foreground` | `222 12% 40%` | `220 6% 64%`   | Texto atenuado (6:1 y 7:1)            |
| `primary`          | `226 44% 14%` | `220 12% 93%`  | Botón principal y opción elegida      |
| `available`        | `152 45% 32%` | `152 30% 30%`  | Franja Disponible                     |
| `playing`          | `6 60% 45%`   | `6 48% 42%`    | Franja En juego                       |
| `warning`          | `36 88% 52%`  | `38 78% 54%`   | Franja Por terminar y Tiempo cumplido |
| `pending`          | `210 58% 40%` | `210 42% 38%`  | Franja Por cobrar                     |
| `maintenance`      | `220 9% 45%`  | `225 6% 34%`   | Franja Mantenimiento                  |

Cada estado tiene además `-foreground` (texto sobre la franja: marfil, o marino en ámbar), `-tone` (texto del estado sobre la tarjeta) y `-soft` (fondo de avisos). Todos los pares cumplen 4.5:1 como mínimo.

### Estados de la consola

| Estado          | Franja      | Icono         | Detalle                      |
| --------------- | ----------- | ------------- | ---------------------------- |
| Disponible      | verde suave | `CircleCheck` | Mandos libres y tarifa       |
| En juego        | rojo        | `Play`        | Cronómetro y avance          |
| Por terminar    | ámbar       | `BellRing`    | Titila los últimos 5 minutos |
| Tiempo cumplido | ámbar       | `TimerOff`    | Fijo hasta finalizar         |
| Por cobrar      | azul        | `Receipt`     | Tiempo detenido y total      |
| Mantenimiento   | gris        | `Wrench`      | Atenuada                     |

### Tipografía

Montserrat Alternates: 500 (texto), 600 (pestañas), 700 (datos y botones) y 800 (estado, nombres y cifras). Títulos de sección en negrita, sin mayúsculas forzadas. Cronómetros e importes con números tabulares.

### Componentes y organización

- Base en `src/components/ui/` (`Text`, `Button`, `Card`, `Badge`, `Input`, `Icon`, copiados de React Native Reusables).
- Patrón de tarjeta: `ConsoleCard`, `PlatformBadge`, `InfoRow` y `PressableScale`. La franja de estado se usa solo en las tarjetas grandes (consola y resumen de cobro).
- Resumen del muro (`WallSummary`): una sola tarjeta con una barra fina de proporción por estado y cuatro columnas (Disponible, En juego, Por terminar —suma tiempo cumplido— y Por cobrar) separadas por líneas finas. El color solo va en la barra y en un punto junto a cada etiqueta; los números van en el color del texto, y en gris cuando son cero. Salud usa el mismo patrón con tres columnas (operativos, mantenimiento, averiados).
- Franjas: «Disponible» usa la franja suave (`available-soft` con texto `available-tone`) porque es el estado de reposo. Los colores fuertes quedan para lo que pide atención: en juego, por terminar, tiempo cumplido y por cobrar.
- Vuelto (`ChangeCalculator`): un campo «Recibido» con el teclado numérico del celular y, debajo, el vuelto o lo que falta. En pago mixto usa solo la parte en efectivo.
- Formularios dentro de `FormScrollView`: al enfocar un campo, la pantalla se desplaza para dejarlo encima del teclado (`react-native-keyboard-controller`).
- `ScreenHeader` en todas las pantallas (marca en la principal; volver o cerrar en el resto), `Section` para agrupar, `StateView` para cargando, error y vacío, `ConfirmDialog` para confirmar, `StatusPill` para el estado en línea, `Logo` y `BrandMark` para la marca, `ThemeToggle` para el tema y `ConsoleSearch` para buscar máquinas.
- Navegación: pestañas Consolas, Caja, Salud y Sistema. Salud es una lista compacta (una fila por máquina con su punto de color, tipo, estado, horas y avisos), con buscador y filtros (Todas, Con avisos, Mantenimiento, Averiadas). Cada fila abre `app/salud/[consoleId].tsx`, donde se cambia el estado de la consola y sus mandos y se registra el mantenimiento. Sistema reúne la apariencia y, en desarrollo, las herramientas de prueba como botones. Cobro y herramientas de desarrollo se abren encima; el diálogo de sesión es un modal.
- Muro: logo y hora; resumen 2 × 2; buscador; filtro por tipo; una columna de tarjetas anchas.
- Caja: total del turno en grande con el reparto por método (barra de proporción), arqueo con el efectivo esperado y el resultado, cobros a revisar e historial compacto de turnos.
- Diálogos con acción principal: el botón queda fijo abajo y suma el margen de la barra del sistema.

### Ícono y pantalla de carga

Al abrir, la pantalla nativa muestra solo el ícono. Cuando la base y la fuente están listas, `BrandSplash` la reemplaza sin salto: mismo ícono, mismo tamaño (100 dp) y mismo lugar. Debajo aparece «ConsoleControl · Panel del local» con un fundido (320 ms), y a los 900 ms todo se desvanece hacia el muro (260 ms).

En blanco y negro: mando blanco roto `220 20% 97%` sobre grafito `225 14% 10%`. Fuentes en `assets/brand/*.svg`; los PNG de `assets/` se exportan de ahí (ícono, adaptativo de Android con su monocromo, pantalla de carga y favicon). La pantalla de carga usa fondo `#F0F2F4` (claro) o `#101219` (oscuro), que son `--background` en hexadecimal; en oscuro el recuadro del ícono es un grafito más claro (`splash-icon-dark.png`) para que se distinga del fondo.

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

| Dónde                             | Movimiento                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------- |
| Cambio de pantalla                | Entra deslizando desde la derecha; al volver sale hacia la derecha (nativo)  |
| Diálogo de sesión                 | Sube desde abajo y al cerrarlo baja (nativo)                                 |
| Pestañas                          | Desplazamiento corto con fundido hacia la pestaña elegida (`shift`)          |
| Tarjeta presionada                | Escala 0.97 en 120 ms                                                        |
| Cambio de estado                  | Color de la franja en 200 ms                                                 |
| Muro al filtrar y Salud al plegar | Reacomodo en 220 ms y fundido de entrada en 200 ms                           |
| Diálogo de confirmación           | Entra de 0.96 a 1 con opacidad en 200 ms; sale encogiéndose a 0.97 en 150 ms |
| Por terminar                      | Titila la etiqueta (opacidad de 1 a 0.4, 700 ms, alternada)                  |
| Pantalla de carga                 | Sale con un fundido de 250 ms                                                |

Curva `cubicBezier(0.23, 1, 0.32, 1)`. Solo se animan `transform`, `opacity` y color. Con movimiento reducido no hay escala ni titileo: queda el cambio de opacidad o de color.

## Revisión

Revisión con cliente simulado: VN, en el rol de propietario, recorrió el prototipo y validó el flujo de iniciar sesión en 2 toques, los colores y los mensajes. El detalle está en [`../qa/validacion-prototipo.md`](../qa/validacion-prototipo.md).
