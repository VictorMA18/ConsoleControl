/** @type {import('tailwindcss').Config} */
const color = (name) => `hsl(var(--${name}))`;
const pair = (name) => ({ DEFAULT: color(name), foreground: color(`${name}-foreground`) });
const state = (name) => ({
  ...pair(name),
  tone: color(`${name}-tone`),
  soft: color(`${name}-soft`),
});

module.exports = {
  // Tema claro por defecto; el oscuro se activa con la clase .dark (src/stores/themeStore.ts).
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Nombres de React Native Reusables (ADR 0012) con valores en HSL (global.css).
      colors: {
        border: color('border'),
        input: color('input'),
        ring: color('ring'),
        background: color('background'),
        foreground: color('foreground'),
        raised: color('raised'),
        primary: pair('primary'),
        secondary: pair('secondary'),
        destructive: pair('destructive'),
        muted: pair('muted'),
        accent: pair('accent'),
        card: pair('card'),
        available: state('available'),
        playing: state('playing'),
        warning: state('warning'),
        pending: state('pending'),
        maintenance: state('maintenance'),
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('./plugins/fontPlugin')],
};
