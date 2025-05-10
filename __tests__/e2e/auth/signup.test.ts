import { test, expect } from '@playwright/test';

test.describe('Sign-up Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('completes standard sign-up successfully', async ({ page }) => {
    // Navigate to sign-up page
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Verify we're on the sign-up page
    await expect(page).toHaveURL(/.*\/signup/);
    
    // Fill in the sign-up form with unique email to avoid duplication
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('Test123!Password');
    
    // Submit the form
    await page.getByRole('button', { name: /sign up|continue|create account/i }).click();
    
    // Verify redirection to onboarding after successful sign-up
    await expect(page).toHaveURL(/.*\/onboarding/);
    
    // Verify welcome message is visible
    await expect(page.getByText(/welcome|get started/i)).toBeVisible();
  });

  test('shows validation errors for invalid inputs', async ({ page }) => {
    // Navigate to sign-up page
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Submit form without any input
    await page.getByRole('button', { name: /sign up|continue|create account/i }).click();
    
    // Verify validation errors are shown
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    
    // Fill in with invalid email format
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('short');
    await page.getByRole('button', { name: /sign up|continue|create account/i }).click();
    
    // Verify format validation errors
    await expect(page.getByText(/invalid email/i)).toBeVisible();
    await expect(page.getByText(/password.*(too short|minimum|requirements)/i)).toBeVisible();
  });

  test('handles duplicate email gracefully', async ({ page }) => {
    // Navigate to sign-up page
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Use an email known to exist in the system
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!Password');
    
    // Submit the form
    await page.getByRole('button', { name: /sign up|continue|create account/i }).click();
    
    // Verify the duplicate email error message is shown
    await expect(page.getByText(/email already (exists|taken|registered)/i)).toBeVisible();
    
    // Verify we're still on the signup page
    await expect(page).toHaveURL(/.*\/signup/);
  });

  test('navigates to sign-in page when sign-in link is clicked', async ({ page }) => {
    // Navigate to sign-up page
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Click on the sign-in link
    await page.getByRole('link', { name: /log in|sign in/i }).click();
    
    // Verify we're on the sign-in page
    await expect(page).toHaveURL(/.*\/login/);
  });
});