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
    // Split large vendors into cacheable chunks. The Azure Speech SDK is loaded
    // lazily (dynamic import) so it never enters the initial payload.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-fluent': ['@fluentui/react-components', '@fluentui/react-icons'],
          'vendor-teams': ['@microsoft/teams-js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // Unit/component tests only; the Playwright E2E specs live in ./e2e.
    include: ['test/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.d.ts'],
    },
  },
});
