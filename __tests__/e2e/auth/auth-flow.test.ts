/**
 * Authentication Flow Tests
 * 
 * These tests verify the authentication flow for the platform,
 * particularly focusing on public access to marketplace and profiles,
 * with authentication triggered only at booking/payment stage.
 * 
 * Version: 1.1.0
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../../utils/e2e-auth-utils';

// Use test fixtures to ensure preconditions
test.describe('Authentication Flow', () => {
  test('Public access to marketplace', async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/marketplace');
    
    // Verify page is accessible without authentication
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/marketplace/i);
    
    // Verify builder cards are visible
    await expect(page.locator('[data-testid="builder-card"]').first()).toBeVisible();
  });
  
  test('Public access to builder profile', async ({ page }) => {
    // Navigate to a builder profile (using Liam's profile as example)
    await page.goto('/profile/liam-jons');
    
    // Verify profile is accessible without authentication
    await expect(page).toHaveURL(/\/profile\/liam-jons/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Liam Jons');
    
    // Verify session types are visible
    await expect(page.locator('[data-testid="session-type-card"]').first()).toBeVisible();
    
    // Verify booking button is visible
    await expect(page.locator('[data-testid="booking-button"]')).toBeVisible();
  });
  
  test('Authentication required for booking', async ({ page }) => {
    // Navigate to a builder profile
    await page.goto('/profile/liam-jons');
    
    // Verify profile loaded correctly
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Liam Jons');
    
    // Click book button
    await page.locator('[data-testid="booking-button"]').click();
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Verify return URL is included
    const url = page.url();
    expect(url).toContain('returnUrl');
    expect(url).toContain('book');
  });
  
  test('Protected dashboard redirects to login', async ({ page }) => {
    // Try to access protected dashboard
    await page.goto('/dashboard');
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Verify return URL is included
    const url = page.url();
    expect(url).toContain('returnUrl');
    expect(url).toContain('dashboard');
  });
});

// Use authenticated test fixtures for role-based access
test.describe('Role-Based Access', () => {
  test.use({ storageState: '.auth/admin.json' });
  
  test('Admin dashboard available for admin users', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Verify admin dashboard is accessible
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admin Dashboard');
  });
});

test.describe('Builder Dashboard Access', () => {
  test.use({ storageState: '.auth/established-builder.json' });
  
  test('Builder dashboard only available for builder users', async ({ page }) => {
    // Navigate to builder dashboard
    await page.goto('/builder-dashboard');
    
    // Verify builder dashboard is accessible
    await expect(page).toHaveURL(/\/builder-dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Builder Dashboard');
  });
});

test.describe('Authentication Edge Cases', () => {
  test.use({ storageState: '.auth/client.json' });
  
  test('Login page redirects authenticated users to dashboard', async ({ page }) => {
    // Try to access login page while authenticated
    await page.goto('/login');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
  
  test('Sign-up page redirects authenticated users to dashboard', async ({ page }) => {
    // Try to access sign-up page while authenticated
    await page.goto('/signup');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});