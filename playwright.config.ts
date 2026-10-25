import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Projects:
 *  - api                        API tests, no browser
 *  - chromium / firefox / webkit UI tests, one project per browser engine
 *
 * Pick one with --project, e.g. `npx playwright test --project=firefox`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: env.expectTimeout },

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.uiBaseUrl,
    headless: env.headless,
    viewport: { width: 1920, height: 1080 },
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiBaseUrl },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
