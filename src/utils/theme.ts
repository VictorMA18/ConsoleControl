import { useColorScheme } from 'nativewind';

// Mismos valores que las variables de global.css, para lo que no acepta className (barra de
// pestañas, iconos fuera de <Icon>, indicadores de carga). Si cambias un color en global.css,
// cámbialo aquí.
const LIGHT = {
  background: 'hsl(220 16% 95%)',
  card: 'hsl(220 20% 99%)',
  border: 'hsl(220 14% 86%)',
  foreground: 'hsl(226 44% 14%)',
  mutedForeground: 'hsl(222 12% 40%)',
} as const;

const DARK = {
  background: 'hsl(225 8% 8%)',
  card: 'hsl(225 7% 11.5%)',
  border: 'hsl(225 6% 20%)',
  foreground: 'hsl(220 12% 93%)',
  mutedForeground: 'hsl(220 6% 64%)',
} as const;

export type ThemeColors = { [K in keyof typeof LIGHT]: string };

export const COLORS: { light: ThemeColors; dark: ThemeColors } = { light: LIGHT, dark: DARK };

// Colores del tema activo (claro u oscuro, según src/stores/themeStore.ts).
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK : LIGHT;
}

// Pesos de Montserrat Alternates que carga la app (app/_layout.tsx).
export const FONTS = {
  medium: 'MontserratAlternates_500Medium',
  semibold: 'MontserratAlternates_600SemiBold',
  bold: 'MontserratAlternates_700Bold',
  extrabold: 'MontserratAlternates_800ExtraBold',
} as const;

// Curva de salida para las transiciones de la interfaz (ADR 0014): arranca rápido y frena suave.
export const EASE_OUT_BEZIER = [0.23, 1, 0.32, 1] as const;
