import { defineConfig, devices } from '@playwright/test';

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '3010';
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${playwrightPort}`;
const apiBaseURL = process.env.PLAYWRIGHT_API_BASE_URL ?? `${baseURL}/api/v1`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command:
          `NEXT_PUBLIC_API_URL=${apiBaseURL} npm run build && ` +
          `NEXT_PUBLIC_API_URL=${apiBaseURL} PORT=${playwrightPort} npm start`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
