# ADR 0012 · React Native Reusables y colores en HSL

## Estado

Aceptada. Los colores y la tipografía los reemplaza el [ADR 0014](0014-sistema-de-diseno-sala-de-control.md).

## Fecha

18/11/2026

## Contexto

Los componentes de interfaz (botones, tarjetas, filtros) se escribían a mano con clases sueltas y colores hexadecimales. Los sprints 2 y 3 agregan muchas pantallas nuevas (cobro, caja, salud, mantenimiento) y hacía falta una base común de componentes y un solo lugar para cambiar colores. VN pidió aplicar React Native Reusables y colores en HSL antes de seguir con el Sprint 2.

## Decisión

- Se **copian** al repositorio los componentes de [React Native Reusables](https://github.com/founded-labs/react-native-reusables) que se necesiten (hoy `text`, `button`, `card` y `badge`) en `src/components/ui/`. No es una librería que se importe en ejecución: el código es del proyecto y se puede editar. Se quitó `asChild` para no depender de `@rn-primitives/slot`, que Jest no transforma.
- Dependencias nuevas, pequeñas y de JavaScript puro: `class-variance-authority`, `clsx` y `tailwind-merge` (esta última junto con `clsx` forma la función `cn` de `src/utils/cn.ts`).
- Los colores son **variables CSS en HSL** en `global.css` ("matiz saturación luminosidad"), con los nombres de Reusables (`background`, `foreground`, `card`, `primary`, `muted`, `border`, ...) más los estados de la consola (`available`, `playing`, `warning`, cada uno con `-foreground` y `-soft`). `tailwind.config.js` solo los referencia con `hsl(var(--nombre))`. Los mismos valores están en `src/utils/theme.ts` para lo que no acepta `className`.
- La paleta de la guía de estilo no cambia: los hexadecimales se convirtieron a HSL y los contrastes se mantienen (5.02, 6.46 y 6.98).
- Nuevos componentes de organización: `StateView` (cargando, error y vacío), `WallSummary` (consolas libres y en juego) y el botón "Iniciar sesión" fijo abajo en el diálogo.
- Sin modo oscuro por ahora; la estructura de variables permite agregarlo después.

## Alternativas descartadas

- Seguir con componentes propios: cada pantalla nueva repetiría estilos y habría que cambiar colores en muchos archivos.
- Instalar la CLI de Reusables con todos sus componentes y `@rn-primitives/*`: trae más dependencias de las que se usan y alguna (como `slot`) no pasa por Jest.
- Hexadecimal con una librería de temas: HSL en variables CSS ya funciona con NativeWind (ADR 0006) sin otra librería.

## Consecuencias

- Las pantallas nuevas usan `src/components/ui/` y solo los tokens de color por nombre (nada de colores sueltos).
- Cambiar un color es editar `global.css` y `src/utils/theme.ts`.
- Si se agrega otro componente de Reusables, se copia con el mismo criterio y, si necesita una dependencia nueva, se agrega a este ADR.
- Los componentes de `ui/` pueden diferir de la versión original de Reusables y hay que revisarlos a mano al actualizarlos.
