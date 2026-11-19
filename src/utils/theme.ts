// Mismos valores que las variables de global.css, para lo que no acepta className (barras de
// navegación, iconos, indicadores de carga). Si cambias un color en global.css, cámbialo aquí.
export const COLORS = {
  background: 'hsl(228 16% 7%)',
  card: 'hsl(228 14% 11%)',
  raised: 'hsl(228 12% 15%)',
  border: 'hsl(228 11% 20%)',
  foreground: 'hsl(40 18% 94%)',
  mutedForeground: 'hsl(228 9% 66%)',
  primary: 'hsl(40 18% 94%)',
  available: 'hsl(152 58% 52%)',
  playing: 'hsl(5 82% 64%)',
  warning: 'hsl(40 96% 56%)',
  pending: 'hsl(199 88% 62%)',
} as const;

// Pesos de DM Sans que carga la app (app/_layout.tsx) y que usa la barra de navegación.
export const FONTS = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;
