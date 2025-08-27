import globals from 'globals';
import eslint from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import mochaPlugin from 'eslint-plugin-mocha';
import reactPlugin from 'eslint-plugin-react';

export default [
  eslint.configs.recommended,
  { ignores: ['dist', 'docs'] },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.browser,
        structuredClone: 'readonly',
      },
    },
    plugins: {
      mocha: mochaPlugin,
      react: reactPlugin,
    },
    rules: {
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'mocha/no-exclusive-tests': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['examples/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
