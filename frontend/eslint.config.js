import globals from 'globals';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';

import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  eslintPluginUnicorn.configs['flat/recommended'],
  ...compat.extends(
    'airbnb',
    'plugin:react/jsx-runtime',
    'airbnb/hooks',
  ),
  eslintConfigPrettier,
  {
    files: [
      '**/*.js',
      '**/*.jsx',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      'react/prop-types': 0, // TODO [2024-01-01]: изучить TypeScript и включить
      'import/prefer-default-export': 'off',
      'jsx-a11y/label-has-associated-control': [
        2,
        {
          controlComponents: ['InputText'],
          depth: 3,
        },
      ],
      'react/jsx-no-bind': 'off', // TODO [2023-12-01]: изучить useCallback и memo, и включить
      'spaced-comment': 'off', // TODO [2023-12-01]: изучить форматирование комментариев JSX в WebStorm и включить
      'unicorn/filename-case': 'off',
      'react/jsx-boolean-value': 'off',
    },
  },
  {
    files: ['eslint.config.js', 'vite.config.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-underscore-dangle': 'off',
    },
  },
  {
    ignores: [
      'dist',
    ],
  },
];
