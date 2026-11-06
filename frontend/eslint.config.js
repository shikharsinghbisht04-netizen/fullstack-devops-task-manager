export default [
  { ignores: ['node_modules/**', 'coverage/**', 'reports/**', 'dist/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly',
                 fetch: 'readonly', console: 'readonly' }
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]' }],
      'no-undef': 'error'
    }
  }
];
