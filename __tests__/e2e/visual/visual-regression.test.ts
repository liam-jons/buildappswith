import { test, expect } from '@playwright/test';

// Skip global auth setup
test.use({ 
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://buildappswith.vercel.app',
  storageState: { cookies: [], origins: [] } // Empty storage state to bypass auth
});

test.describe('Visual Regression Tests', () => {
  test('homepage visual appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot and compare it with the baseline
    await expect(page).toHaveScreenshot('homepage.png');
  });
  
  test('marketplace visual appearance', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot and compare it with the baseline
    await expect(page).toHaveScreenshot('marketplace.png');
  });
  
  test('login page visual appearance', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot and compare it with the baseline
    await expect(page).toHaveScreenshot('login.png');
  });
  
  test('signup page visual appearance', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot and compare it with the baseline
    await expect(page).toHaveScreenshot('signup.png');
  });
});