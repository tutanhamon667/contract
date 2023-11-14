export default {
  singleQuote: true,
  printWidth: 100,
  overrides: [
    {
      files: [
        'dist',
        'vite.config.js',
      ],
      options: { requirePragma: true },
    },
  ],
};
