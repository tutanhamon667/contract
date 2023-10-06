import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from "@nabla/vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/freelancing-platform-project/',
  plugins: [
    react(),
    eslintPlugin(),
  ],
  server: {
    open: true,
  },
})
