# ADR 0014 · Sistema de diseño «tarjeta de estado», tema claro y oscuro

## Estado

Aceptada. Reemplaza los colores y la tipografía definidos en el [ADR 0012](0012-react-native-reusables-y-colores-hsl.md); lo demás de ese ADR (componentes copiados de React Native Reusables y tokens HSL) sigue vigente. Reemplaza también la primera versión de este ADR (tema oscuro «sala de control» con DM Sans), que VN descartó por genérica antes de fusionarse.

## Fecha

19/11/2026

## Contexto

VN diseñó la tarjeta de consola que quiere ver en el muro: una franja de color a todo el ancho con el estado en blanco y negrita, debajo una pastilla con el logo de la plataforma, el nombre grande de la máquina, un reloj con el tiempo y, separada por una línea vertical, una columna de datos con icono. Pidió que todo el sistema de diseño salga de ese componente, con Montserrat Alternates, tema claro por defecto y posibilidad de pasar a oscuro, todo en HSL y sin blanco ni negro puros.

## Decisión

- **Patrón base.** Toda superficie con estado repite la tarjeta: franja del color del estado con icono y etiqueta, cuerpo en `card` y datos en filas de icono y texto (`InfoRow`). Se aplica en el muro (`ConsoleCard`), el resumen por estado (`WallSummary`), el resumen de cobro (`SettlementSummary`) y el vuelto (`ChangeCalculator`).
- **Tema.** Claro por defecto, oscuro opcional. Las variables viven en `global.css` (`:root` y `.dark:root`) con los nombres de Reusables; `tailwind.config.js` usa `darkMode: 'class'`. Quien atiende elige Sistema, Claro u Oscuro (`ThemeToggle` en Caja y `ThemeButton` en el muro); la elección se guarda con `expo-sqlite/kv-store` (`src/stores/themeStore.ts`) y se aplica con `colorScheme.set` de NativeWind.
- **Color.** Texto azul marino `226 44% 14%` sobre gris azulado `220 16% 95%` (claro) y marfil frío sobre `224 22% 8%` (oscuro). Cada estado tiene cuatro tokens: `DEFAULT` (franja), `foreground` (texto sobre la franja), `tone` (texto del estado sobre la tarjeta) y `soft` (fondo de avisos). Todos los pares cumplen WCAG AA (4.5:1 como mínimo).
- **Tipografía.** Montserrat Alternates (`@expo-google-fonts/montserrat-alternates`) en 500, 600, 700 y 800; el cuerpo usa 500. Cronómetros e importes con números tabulares.
- **Plataforma.** `PlatformBadge` dibuja el símbolo y el modelo de PlayStation con los trazos de Simple Icons (CC0, copiados en `src/components/platformLogos.ts`). Xbox y Nintendo Switch ya no están en Simple Icons y muestran el nombre en texto.
- **Marca.** Ícono propio: mando marfil sobre el verde de «Disponible» (`assets/brand/*.svg`, exportado a los PNG de `assets/`). Se muestra en la pantalla de carga nativa (`expo-splash-screen`), que se queda hasta que la base de datos y la fuente están listas y sale con un fundido de 250 ms. La configuración nativa no acepta HSL: `app.json` lleva los hexadecimales equivalentes a `--background` y `--available`.
- **Movimiento** (criterios de la skill `expo-animation`):
  - pantallas con la transición nativa de la plataforma; diálogo de sesión como modal que sube; pestañas sin animación;
  - tarjeta presionada a 0.97 en 120 ms (`PressableScale`); color de la franja que cambia en 200 ms;
  - en el muro, reacomodo con `LinearTransition` (220 ms) y fundido de entrada de 200 ms;
  - `ConfirmDialog` entra desde 0.96 con opacidad en 200 ms sobre el fundido nativo del fondo;
  - curva `cubicBezier(0.23, 1, 0.32, 1)`; solo se animan `transform`, `opacity` y color; con movimiento reducido no hay escala ni titileo.
- **Bordes del sistema.** La app se dibuja de borde a borde: la barra de pestañas y los botones fijos abajo suman el margen inferior del sistema (`useInsets`).

## Consecuencias

- Cambiar un color es cambiar una variable en `global.css` y su copia en `src/utils/theme.ts` (para lo que no acepta className).
- El ícono, la pantalla de carga y el ícono adaptativo son configuración nativa: se ven en un APK nuevo, no en Expo Go.
- El prototipo de Figma queda desactualizado hasta que se rehaga con este sistema.
