/**
 * Authentication Flow Tests
 * 
 * These tests verify the authentication flow for the platform,
 * particularly focusing on public access to marketplace and profiles,
 * with authentication triggered only at booking/payment stage.
 * 
 * Version: 1.0.0
 */

import { test, expect } from '@playwright/test';

// Base URL for tests
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test('Public access to marketplace', async ({ page }) => {
    // Navigate to marketplace
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Verify page is accessible without authentication
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.locator('h1')).toContainText('Marketplace');
    
    // Verify builder cards are visible
    await expect(page.locator('[data-testid="builder-card"]').first()).toBeVisible();
  });
  
  test('Public access to builder profile', async ({ page }) => {
    // Navigate to a builder profile (using Liam's profile as example)
    await page.goto(`${BASE_URL}/profile/liam-jons`);
    
    // Verify profile is accessible without authentication
    await expect(page).toHaveURL(/\/profile\/liam-jons/);
    await expect(page.locator('h1')).toContainText('Liam Jons');
    
    // Verify session types are visible
    await expect(page.locator('[data-testid="session-type-card"]').first()).toBeVisible();
    
    // Verify booking button is visible
    await expect(page.locator('[data-testid="booking-button"]')).toBeVisible();
  });
  
  test('Authentication required for booking', async ({ page }) => {
    // Navigate to a builder profile
    await page.goto(`${BASE_URL}/profile/liam-jons`);
    
    // Verify profile loaded correctly
    await expect(page.locator('h1')).toContainText('Liam Jons');
    
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
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Verify return URL is included
    const url = page.url();
    expect(url).toContain('returnUrl');
    expect(url).toContain('dashboard');
  });
  
  test('Full authentication flow: profile -> booking -> login -> booking', async ({ page }) => {
    // Set up test user credentials
    const testEmail = 'test-user@example.com';
    const testPassword = 'test-password-123';
    
    // Navigate to a builder profile
    await page.goto(`${BASE_URL}/profile/liam-jons`);
    
    // Verify profile loaded correctly
    await expect(page.locator('h1')).toContainText('Liam Jons');
    
    // Click book button
    await page.locator('[data-testid="booking-button"]').click();
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
    
    // Fill in login form
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);
    await page.locator('button[type="submit"]').click();
    
    // Verify redirect back to booking flow
    await expect(page).toHaveURL(/\/book\/liam-jons/);
    
    // Verify booking components are visible
    await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible();
  });
  
  test('Protected API route rejects unauthenticated requests', async ({ request }) => {
    // Make an unauthenticated request to a protected API route
    const response = await request.get(`${BASE_URL}/api/auth/test`);
    
    // Verify the response
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody.success).toBe(false);
    expect(responseBody.error.type).toBe('AUTHENTICATION_ERROR');
  });
  
  test('Role-protected API route rejects unauthorized requests', async ({ request }) => {
    // This test requires a valid auth token with missing role
    // In a real test, you would use auth helpers to get this token
    
    // Make an authenticated request but missing required role
    const response = await request.post(`${BASE_URL}/api/auth/test`, {
      headers: {
        'x-user-id': 'test-user-id',
        'x-user-roles': JSON.stringify(['CLIENT']) // Missing ADMIN role
      }
    });
    
    // Verify the response
    expect(response.status()).toBe(403);
    
    const responseBody = await response.json();
    expect(responseBody.success).toBe(false);
    expect(responseBody.error.type).toBe('AUTHORIZATION_ERROR');
  });
});

test.describe('Role-Based Access', () => {
  test('Admin dashboard available for admin users', async ({ page, context }) => {
    // Set up admin user session
    // In a real test, you would use auth helpers to set up the session
    
    // Set cookies or session data to simulate admin user
    await context.addCookies([
      {
        name: '__session',
        value: 'admin-session-token',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      }
    ]);
    
    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/admin`);
    
    // Verify admin dashboard is accessible
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });
  
  test('Builder dashboard only available for builder users', async ({ page, context }) => {
    // Set up builder user session
    // In a real test, you would use auth helpers to set up the session
    
    // Set cookies or session data to simulate builder user
    await context.addCookies([
      {
        name: '__session',
        value: 'builder-session-token',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      }
    ]);
    
    // Navigate to builder dashboard
    await page.goto(`${BASE_URL}/builder-dashboard`);
    
    // Verify builder dashboard is accessible
    await expect(page).toHaveURL(/\/builder-dashboard/);
    await expect(page.locator('h1')).toContainText('Builder Dashboard');
  });
});

test.describe('Authentication Edge Cases', () => {
  test('Login page redirects authenticated users to dashboard', async ({ page, context }) => {
    // Set up authenticated user session
    // In a real test, you would use auth helpers to set up the session
    
    // Set cookies or session data to simulate authenticated user
    await context.addCookies([
      {
        name: '__session',
        value: 'authenticated-session-token',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      }
    ]);
    
    // Try to access login page while authenticated
    await page.goto(`${BASE_URL}/login`);
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
  
  test('Sign-up page redirects authenticated users to dashboard', async ({ page, context }) => {
    // Set up authenticated user session
    // In a real test, you would use auth helpers to set up the session
    
    // Set cookies or session data to simulate authenticated user
    await context.addCookies([
      {
        name: '__session',
        value: 'authenticated-session-token',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      }
    ]);
    
    // Try to access sign-up page while authenticated
    await page.goto(`${BASE_URL}/sign-up`);
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
