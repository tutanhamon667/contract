import react from '@vitejs/plugin-react';
import eslintPlugin from '@nabla/vite-plugin-eslint';

// https://vitejs.dev/config/
export default {
  plugins: [
    react(),
    eslintPlugin({
      formatter: 'stylish',
    }),
  ],
  server: {
    open: true,
  },
};
