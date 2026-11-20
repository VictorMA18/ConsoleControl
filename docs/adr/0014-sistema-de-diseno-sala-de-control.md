# ADR 0014 · Sistema de diseño «sala de control»

## Estado

Aceptada. Reemplaza los colores y la tipografía definidos en el [ADR 0012](0012-react-native-reusables-y-colores-hsl.md); lo demás de ese ADR (componentes copiados de React Native Reusables y tokens HSL) sigue vigente.

## Fecha

19/11/2026

## Contexto

La primera versión de la interfaz (tema claro azul, franjas de color en las tarjetas, fuente del sistema) se veía genérica y poco cuidada: el muro de consolas colapsaba filas en algunos celulares, el resumen solo mostraba dos estados, los diálogos eran los del sistema y no había identidad visual. VN pidió un diseño profesional, con DM Sans, iconos, un logo y sin el aspecto de plantilla.

## Decisión

- **Tema oscuro único** para un local con poca luz: grafito azulado (`228 16% 7%`) con texto marfil (`40 18% 94%`). Sin gradientes, sin sombras de adorno y sin color de marca: el color se reserva para los estados de la consola. La acción principal usa el contraste (botón marfil con texto oscuro), no un azul.
- **Estados con cuatro señales:** color, icono, texto y, en alerta, parpadeo. `disponible` (verde, `CircleCheck`), `en_juego` (coral, `Play`), `por_terminar` (ámbar titilante, `BellRing`), `tiempo_cumplido` (ámbar fijo, `TimerOff`), `por_cobrar` (cian, `Receipt`) y `mantenimiento` (gris, `Wrench`). El muro resume cuántas consolas hay en cada uno.
- **Tipografía DM Sans** (`@expo-google-fonts/dm-sans`, pesos 400 a 800). Cada peso es un archivo distinto en Android, así que el plugin `plugins/dmSansPlugin.js` hace que `font-bold`, `font-medium`, etc. elijan el archivo correcto. Números tabulares en cronómetros e importes.
- **Iconos con Lucide** (`lucide-react-native` y `react-native-svg`, que ya trae Expo): es la librería que usa Reusables y tiene todos los iconos que hacen falta. Se usan con el componente `Icon` y colores por clase.
- **Logo:** un mando (`Gamepad2`) en un recuadro marfil con el nombre en dos pesos (`Logo`).
- **Navegación:** barra de pestañas (Consolas y Caja; Salud en el Sprint 3) y una cabecera propia (`ScreenHeader`) en todas las pantallas, con volver o cerrar. Los diálogos de confirmación usan `ConfirmDialog` en lugar del `Alert` del sistema.
- Se evita `flex-1` en vertical dentro de contenedores de altura automática: era la causa de las tarjetas colapsadas en el muro. El muro usa filas con `flex-wrap` de dos columnas.

## Alternativas descartadas

- Mantener el tema claro: en un local con poca luz cansa la vista y se ve como una plantilla más.
- Un color de marca (azul, violeta o lima): choca con los colores de estado, que son los que deben destacar.
- `@rn-primitives/alert-dialog` para los diálogos: agrega dependencias que Jest no transforma; un `Modal` propio alcanza.
- Íconos de `@expo/vector-icons`: sin la coherencia de trazo de Lucide ni su uso con clases de Tailwind.

## Consecuencias

- Todas las pantallas nuevas usan `ScreenHeader`, `Section`, `StateView`, `Icon` y los tokens por nombre; nada de colores sueltos.
- Contrastes calculados (WCAG): texto sobre fondo 16.8:1; texto atenuado sobre tarjeta 7.0:1; estados sobre tarjeta entre 5.5:1 y 9.6:1; texto de botón sobre marfil 16.5:1.
- Jest apunta `lucide-react-native` a su build CommonJS (`moduleNameMapper` en `package.json`).
- El prototipo de Figma del Sprint 1 queda desactualizado en colores y tipografía hasta que se actualice (pendiente).
