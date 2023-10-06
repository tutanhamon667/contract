module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'react-app',
    // 'plugin:import/recommended',
    // 'airbnb',
    'airbnb/hooks',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.js',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
      },
    ],
    'react/prop-types': 0,
  },
}
