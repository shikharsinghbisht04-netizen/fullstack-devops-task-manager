module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'reports/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly', module: 'writable', process: 'readonly',
        console: 'readonly', describe: 'readonly', test: 'readonly',
        expect: 'readonly'
      }
    },
    rules: { 'no-unused-vars': 'error', 'no-undef': 'error' }
  }
];
