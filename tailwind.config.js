/** @type {import('tailwindcss').Config} */
const color = (name) => `hsl(var(--${name}))`;
const pair = (name) => ({ DEFAULT: color(name), foreground: color(`${name}-foreground`) });

module.exports = {
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
        primary: pair('primary'),
        secondary: pair('secondary'),
        destructive: pair('destructive'),
        muted: pair('muted'),
        accent: pair('accent'),
        card: pair('card'),
        available: { ...pair('available'), soft: color('available-soft') },
        playing: { ...pair('playing'), soft: color('playing-soft') },
        warning: { ...pair('warning'), soft: color('warning-soft') },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
