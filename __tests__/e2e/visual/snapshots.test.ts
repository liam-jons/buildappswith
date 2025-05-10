import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Skip authentication setup for visual tests
test.describe.configure({ mode: 'parallel' });

// Critical pages to capture for visual regression testing
test.describe('Visual Snapshots', () => {
  // Skip the global authentication setup
  test.use({ 
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://buildappswith.vercel.app',
    storageState: { cookies: [], origins: [] } // Empty storage state to bypass auth
  });
  
  // Define path for screenshots
  const chromaticDir = path.join(process.cwd(), 'test-results/chromatic-archives/chromatic-archives');
  
  // Ensure directory exists
  if (!fs.existsSync(chromaticDir)) {
    fs.mkdirSync(chromaticDir, { recursive: true });
  }
  
  test('capture marketplace page', async ({ page }) => {
    // Marketplace
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    // Save screenshot directly in the chromatic-archives directory
    await page.screenshot({ 
      path: path.join(chromaticDir, 'marketplace.png'), 
      fullPage: true 
    });
  });
  
  test('capture login page', async ({ page }) => {
    // Login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Save screenshot directly in the chromatic-archives directory
    await page.screenshot({ 
      path: path.join(chromaticDir, 'login.png'), 
      fullPage: true 
    });
  });
  
  test('capture sign up page', async ({ page }) => {
    // Sign up page
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Save screenshot directly in the chromatic-archives directory
    await page.screenshot({ 
      path: path.join(chromaticDir, 'signup.png'), 
      fullPage: true 
    });
  });
  
  test('capture homepage', async ({ page }) => {
    // Home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Save screenshot directly in the chromatic-archives directory
    await page.screenshot({ 
      path: path.join(chromaticDir, 'homepage.png'), 
      fullPage: true 
    });
  });
});