/**
 * Simple Playwright configuration for tests that don't require authentication
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e/playwright-results.json' }],
  ],
  // Skip global setup (no authentication needed)
  globalSetup: undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Empty storage state (no authentication)
    storageState: { cookies: [], origins: [] }
  },
  // Only run chromium tests for simplicity
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  // Only run basic.test.ts
  testMatch: '**/basic.test.ts',
});