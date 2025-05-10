/**
 * Playwright configuration for tests that declare specific project requirements
 * 
 * This configuration is used for tests that need to specify a project in the test file
 * rather than relying on the global project configuration.
 */
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

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
  globalSetup: require.resolve('./__tests__/e2e/global-setup'),
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Test projects using pre-authenticated states
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
    
    // Role-specific authenticated test projects
    {
      name: 'auth:client',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/client.json'),
      },
    },
    {
      name: 'auth:premium-client',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/premium-client.json'),
      },
    },
    {
      name: 'auth:new-builder',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/new-builder.json'),
      },
    },
    {
      name: 'auth:established-builder',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/established-builder.json'),
      },
    },
    {
      name: 'auth:admin',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/admin.json'),
      },
    },
    {
      name: 'auth:multi-role',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(process.cwd(), '.auth/multi-role.json'),
      },
    },
  ],
});