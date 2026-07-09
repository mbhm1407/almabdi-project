import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration. Tests run against the built SPA served by
 * `vite preview`. Because the app degrades gracefully outside a Teams host
 * (see initTeams timeout), the pre-hearing experience, RTL, accessibility and
 * the auth-required error path can all be validated headlessly here. The live
 * transcription flow itself requires the Teams host + Azure Speech and is
 * validated at the unit/integration layer.
 */
const preInstalledChromium = process.env.SMJ_CHROME_PATH;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    locale: 'ar-SA',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
          ...(preInstalledChromium ? { executablePath: preInstalledChromium } : {}),
        },
      },
    },
  ],
});
