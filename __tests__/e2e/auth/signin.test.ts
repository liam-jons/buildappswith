import { test, expect } from '@playwright/test';

test.describe('Sign-in Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('allows user to sign in successfully', async ({ page }) => {
    // Click on the login button (matches the actual text on the page)
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Verify we're on the sign-in page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Fill in the sign-in form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    
    // Click the submit button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Verify redirection to dashboard after successful sign-in
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Verify user is authenticated
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });
  
  test('redirects builder to builder dashboard after login', async ({ page }) => {
    // Click on the login button
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Fill in the sign-in form with builder credentials
    await page.getByLabel(/email/i).fill('builder@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    
    // Click the submit button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Verify redirection to builder dashboard
    await expect(page).toHaveURL(/.*\/builder/);
    
    // Verify builder-specific elements are visible
    await expect(page.getByText(/session types|availability|clients/i)).toBeVisible();
  });
  
  test('redirects admin to admin panel after login', async ({ page }) => {
    // Click on the login button
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Fill in the sign-in form with admin credentials
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    
    // Click the submit button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Verify redirection to admin panel
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Verify admin-specific elements are visible
    await expect(page.getByText(/admin|dashboard|users|settings/i)).toBeVisible();
  });
  
  test('persists authentication across page navigation', async ({ page }) => {
    // Sign in first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate to a different page
    await page.goto('/marketplace');
    
    // Verify still authenticated (not redirected to login)
    await expect(page).toHaveURL(/.*\/marketplace/);
    
    // Verify authenticated user-specific elements are visible
    await expect(page.getByRole('link', { name: /profile|account|settings/i })).toBeVisible();
    
    // Navigate to another page
    await page.goto('/profile');
    
    // Verify still authenticated
    await expect(page).not.toHaveURL(/.*\/login/);
  });
  
  test('shows error message for invalid credentials', async ({ page }) => {
    // Click on the login button
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Fill in the sign-in form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    
    // Click the submit button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    
    // Verify we're still on the sign-in page
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('shows appropriate message after too many failed attempts', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Attempt multiple failed logins (usually 5+ triggers rate limiting)
    for (let i = 0; i < 5; i++) {
      await page.getByLabel(/email/i).fill('locked@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword123!');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      // Small wait to ensure requests are processed
      await page.waitForTimeout(500);
    }
    
    // Check for rate limiting or account lockout message
    await expect(page.getByText(/too many attempts|try again later|temporarily locked/i)).toBeVisible();
  });
  
  test('navigates to sign-up page when sign-up link is clicked', async ({ page }) => {
    // Click on the login button
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Click on the sign-up link
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Verify we're on the sign-up page
    await expect(page).toHaveURL(/.*\/signup/);
  });
  
  test('requires email and password fields', async ({ page }) => {
    // Click on the login button
    await page.getByRole('link', { name: /log in/i }).click();
    
    // Click submit without filling in fields
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });
  
  test('forgot password flow works correctly', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Click forgot password link
    await page.getByRole('link', { name: /forgot|reset|password/i }).click();
    
    // Verify on password reset page
    await expect(page).toHaveURL(/.*\/password-reset|forgot-password/);
    
    // Fill email for reset
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();
    
    // Verify success message is shown
    await expect(page.getByText(/email sent|check your email|recovery|link sent/i)).toBeVisible();
  });
});