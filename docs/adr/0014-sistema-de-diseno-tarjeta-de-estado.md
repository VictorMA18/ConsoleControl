# ADR 0014 · Sistema de diseño «tarjeta de estado», tema claro y oscuro

## Estado

Aceptada. Reemplaza los colores y la tipografía definidos en el [ADR 0012](0012-react-native-reusables-y-colores-hsl.md); lo demás de ese ADR (componentes copiados de React Native Reusables y tokens HSL) sigue vigente. Reemplaza también la primera versión de este ADR (tema oscuro «sala de control» con DM Sans), que VN descartó por genérica antes de fusionarse.

## Fecha

19/11/2026

## Contexto

VN diseñó la tarjeta de consola que quiere ver en el muro: una franja de color a todo el ancho con el estado en blanco y negrita, debajo una pastilla con el logo de la plataforma, el nombre grande de la máquina, un reloj con el tiempo y, separada por una línea vertical, una columna de datos con icono. Pidió que todo el sistema de diseño salga de ese componente, con Montserrat Alternates, tema claro por defecto y posibilidad de pasar a oscuro, todo en HSL y sin blanco ni negro puros.

## Decisión

- **Patrón base.** Las tarjetas grandes con estado repiten la tarjeta: franja del color del estado con icono y etiqueta, cuerpo en `card` y datos en filas de icono y texto (`InfoRow`). Se aplica en el muro (`ConsoleCard`) y el resumen de cobro (`SettlementSummary`). Las fichas pequeñas (resumen 2 × 2 del muro) no llevan franja: el color va solo en el icono, porque repetir franjas en piezas pequeñas se veía recargado.
- **Tema.** Claro por defecto, oscuro opcional. Las variables viven en `global.css` (`:root` y `.dark:root`) con los nombres de Reusables; `tailwind.config.js` usa `darkMode: 'class'`. Quien atiende elige Sistema, Claro u Oscuro (`ThemeToggle` en la pestaña Sistema); la elección se guarda con `expo-sqlite/kv-store` (`src/stores/themeStore.ts`) y se aplica con `colorScheme.set` de NativeWind.
- **Color.** Texto azul marino `226 44% 14%` sobre gris azulado `220 16% 95%` (claro) y marfil frío sobre `224 22% 8%` (oscuro). Cada estado tiene cuatro tokens: `DEFAULT` (franja), `foreground` (texto sobre la franja), `tone` (texto del estado sobre la tarjeta) y `soft` (fondo de avisos). Todos los pares cumplen WCAG AA (4.5:1 como mínimo).
- **Tipografía.** Montserrat Alternates (`@expo-google-fonts/montserrat-alternates`) en 500, 600, 700 y 800; el cuerpo usa 500. Cronómetros e importes con números tabulares.
- **Plataforma.** `PlatformBadge` dibuja el símbolo y el modelo de PlayStation con los trazos de Simple Icons (CC0, copiados en `src/components/platformLogos.ts`). Xbox y Nintendo Switch salen de Simple Icons 9.0 (la última versión que los incluye) y van con el nombre en texto.
- **Marca.** Ícono propio en blanco y negro: mando blanco roto sobre grafito (`assets/brand/*.svg`, exportado a los PNG de `assets/`). Se muestra en la pantalla de carga nativa (`expo-splash-screen`), que se queda hasta que la base de datos y la fuente están listas y sale con un fundido de 250 ms. La configuración nativa no acepta HSL: `app.json` lleva los hexadecimales equivalentes a `--background` y al grafito del ícono.
- **Movimiento** (criterios de la skill `expo-animation`):
  - pantallas que entran deslizando desde la derecha y salen hacia la derecha al volver; diálogo de sesión que sube y baja al cerrarlo; pestañas con un desplazamiento corto y fundido (`shift`), a pedido de VN;
  - tarjeta presionada a 0.97 en 120 ms (`PressableScale`); color de la franja que cambia en 200 ms;
  - en el muro, reacomodo con `LinearTransition` (220 ms) y fundido de entrada de 200 ms;
  - `ConfirmDialog` entra desde 0.96 con opacidad en 200 ms y sale encogiéndose en 150 ms (se mantiene montado mientras sale);
  - curva `cubicBezier(0.23, 1, 0.32, 1)`; solo se animan `transform`, `opacity` y color; con movimiento reducido no hay escala ni titileo.
- **Bordes del sistema y teclado.** La app se dibuja de borde a borde: la barra de pestañas, los botones fijos abajo y el final de las pantallas sin barra suman el margen inferior del sistema (`useInsets`). Los formularios usan `react-native-keyboard-controller` (`KeyboardProvider` y `FormScrollView`), incluido en Expo Go, para que el campo enfocado quede encima del teclado.
- **Identificadores.** Las máquinas se llaman «MAQ #n» (migración 0005) y el muro tiene un buscador por número.

## Revisión del 19/11/2026

- **Estados más sobrios.** «Disponible» pasa a una franja suave porque es el estado de reposo; los colores fuertes quedan para lo que pide atención.
- **Modo oscuro.** El fondo deja el azul marino saturado (`224 22% 8%`) y pasa a un grafito casi neutro (`225 8% 8%`), con escalones de superficie más claros.
- **Resúmenes.** Las fichas con cuadrito de color de cada estado se reemplazan por una tarjeta con barra de proporción y columnas.
- **Salud.** Pasa de tarjetas desplegables a una lista compacta con filtros y una pantalla de detalle por máquina.
- **Pantalla de carga.** Se agrega la pantalla de marca `BrandSplash`.

## Segunda revisión (19/11/2026, evaluada en emulador)

- **Resumen:** tarjetas 2 × 2 limpias, sin barras de proporción. Las tarjetas de consola tampoco llevan barra de avance.
- **Franjas de aviso:** «Por terminar» y «Tiempo cumplido» pasan a ámbar suave.
- **Cobro:** muestra el mismo estado que la tarjeta del muro.
- **Tarjeta de consola:** el nombre va en su propia fila, a todo el ancho, para no cortarse en pantallas de 360 dp.
- **Navegación:** barra inferior estilo Material 3 con pastilla, cabeceras con título grande y línea de contexto, y transiciones `ios_from_right` y `fade_from_bottom`.
- **Textos:** sin mayúsculas forzadas.

## Consecuencias

- Cambiar un color es cambiar una variable en `global.css` y su copia en `src/utils/theme.ts` (para lo que no acepta className).
- El ícono, la pantalla de carga y el ícono adaptativo son configuración nativa: se ven en un APK nuevo, no en Expo Go.
- El prototipo de Figma queda desactualizado hasta que se rehaga con este sistema.
