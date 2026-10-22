module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'expo-sqlite',
            message: 'Usa src/db/repositories; solo la capa de datos accede a SQLite.',
          },
          {
            name: 'drizzle-orm',
            message: 'Usa src/db/repositories; solo la capa de datos accede a SQLite.',
          },
        ],
        patterns: [
          {
            group: ['drizzle-orm/*'],
            message: 'Usa src/db/repositories; solo la capa de datos accede a SQLite.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/db/**/*.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
