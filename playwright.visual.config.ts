import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './__tests__/e2e/visual',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/visual/playwright-results.json' }],
  ],
  // Skip global setup for visual tests
  globalSetup: undefined,
  use: {
    // Use test URLs instead of localhost if needed
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://buildappswith.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  expect: {
    // Configure visual comparison options
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});