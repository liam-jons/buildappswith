/**
 * Basic E2E tests that don't require authentication
 */
import { test, expect } from '@playwright/test';

test.describe('Basic Page Access', () => {
  test('access public homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for common header elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for a login link - use a more specific selector to avoid strict mode violation
    // Specifically target the one in the main header/banner
    const loginLink = page.getByRole('banner').getByRole('link', { name: 'Log In' });
    await expect(loginLink).toBeVisible();
  });
  
  test('access public marketplace', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify there are navigation elements present
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Check for heading elements that should exist in any view
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });
});

// Skip the global auth setup for this test file
test.use({ storageState: { cookies: [], origins: [] } });