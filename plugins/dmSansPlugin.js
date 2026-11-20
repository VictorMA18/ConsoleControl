const plugin = require('tailwindcss/plugin');

// En Android cada peso de una fuente es un archivo distinto: font-bold no basta con fontWeight.
// Cada utilidad de peso elige el archivo de DM Sans que corresponde (se cargan en app/_layout.tsx).
module.exports = plugin(function ({ addUtilities }) {
  addUtilities({ '.font-sans': { fontFamily: 'DMSans_400Regular' } });
  addUtilities({
    '.font-normal': { fontFamily: 'DMSans_400Regular' },
    '.font-medium': { fontFamily: 'DMSans_500Medium' },
    '.font-semibold': { fontFamily: 'DMSans_600SemiBold' },
    '.font-bold': { fontFamily: 'DMSans_700Bold' },
    '.font-extrabold': { fontFamily: 'DMSans_800ExtraBold' },
  });
});
