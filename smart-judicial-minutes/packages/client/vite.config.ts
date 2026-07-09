/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vite config for the Teams tab SPA. The dev server runs over HTTPS because
 * Teams only loads tab content from secure origins.
 */
export default defineConfig({
  plugins: [react()],
  // Do not search parent directories for a PostCSS config; this project uses none.
  css: { postcss: { plugins: [] } },
  server: {
    port: 5173,
    https: undefined, // supply a cert via `vite --https` or a reverse proxy in dev
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:3978',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
