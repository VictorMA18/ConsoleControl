const plugin = require('tailwindcss/plugin');

// En Android cada peso de una fuente es un archivo distinto: font-bold no basta con fontWeight.
// Cada utilidad de peso elige el archivo de Montserrat Alternates que corresponde (se cargan en
// app/_layout.tsx). El cuerpo usa Medium: Regular se ve delgada en pantallas a distancia.
module.exports = plugin(function ({ addUtilities }) {
  addUtilities({ '.font-sans': { fontFamily: 'MontserratAlternates_500Medium' } });
  addUtilities({
    '.font-normal': { fontFamily: 'MontserratAlternates_500Medium' },
    '.font-medium': { fontFamily: 'MontserratAlternates_500Medium' },
    '.font-semibold': { fontFamily: 'MontserratAlternates_600SemiBold' },
    '.font-bold': { fontFamily: 'MontserratAlternates_700Bold' },
    '.font-extrabold': { fontFamily: 'MontserratAlternates_800ExtraBold' },
  });
});
