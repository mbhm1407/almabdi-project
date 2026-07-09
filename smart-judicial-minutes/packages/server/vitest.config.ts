import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Prevent Vite from walking up into unrelated parent PostCSS configs.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/**/*.types.ts'],
    },
  },
});
