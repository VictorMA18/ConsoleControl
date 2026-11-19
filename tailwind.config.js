/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Paleta de alto contraste (T04). Cada color de estado se acompaña siempre de su etiqueta.
      colors: {
        canvas: '#F1F5F9',
        surface: '#FFFFFF',
        ink: '#0F172A',
        muted: '#475569',
        line: '#CBD5E1',
        primary: { DEFAULT: '#0369A1', pressed: '#075985' },
        available: { DEFAULT: '#15803D', soft: '#DCFCE7' },
        playing: { DEFAULT: '#B91C1C', soft: '#FEE2E2' },
        warning: { DEFAULT: '#F59E0B', ink: '#78350F', soft: '#FEF3C7' },
      },
    },
  },
  plugins: [],
};
