import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  // For these tests, we want to start already logged in
  test.beforeEach(async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('multi-role@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Verify we're logged in
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('allows user to view their profile', async ({ page }) => {
    // Navigate to profile page
    await page.getByRole('link', { name: /profile|account/i }).click();
    
    // Verify we're on the profile page
    await expect(page).toHaveURL(/.*\/profile/);
    
    // Verify profile information is displayed
    await expect(page.getByText(/account information|personal details/i)).toBeVisible();
    await expect(page.getByText(/multi-role@example.com/i)).toBeVisible();
  });

  test('allows user to edit profile information', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    
    // Click edit button or profile section
    await page.getByRole('button', { name: /edit( profile)?|update/i }).click();
    
    // Edit a profile field
    const newName = `Test User ${Date.now()}`; // Unique name to verify update
    await page.getByLabel(/name|full name/i).fill(newName);
    
    // Save changes
    await page.getByRole('button', { name: /save|update|submit/i }).click();
    
    // Verify success message
    await expect(page.getByText(/profile updated|changes saved/i)).toBeVisible();
    
    // Verify the name was updated
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('validates profile information on edit', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: /edit( profile)?|update/i }).click();
    
    // Clear a required field
    await page.getByLabel(/name|full name/i).fill('');
    
    // Try to save
    await page.getByRole('button', { name: /save|update|submit/i }).click();
    
    // Verify validation error
    await expect(page.getByText(/name is required|field is required/i)).toBeVisible();
    
    // Check we're still on the edit form
    await expect(page.getByRole('button', { name: /save|update|submit/i })).toBeVisible();
  });

  test('allows user with multiple roles to switch roles', async ({ page }) => {
    // Assume we're starting on dashboard as a user with CLIENT role
    
    // Find and click the role switcher
    await page.getByRole('button', { name: /switch( role)?|change role/i }).click();
    
    // Select builder role
    await page.getByRole('menuitem', { name: /builder/i }).click();
    
    // Verify we're now on builder dashboard
    await expect(page).toHaveURL(/.*\/builder/);
    
    // Verify builder-specific UI elements
    await expect(page.getByText(/session types|availability|clients/i)).toBeVisible();
    
    // Switch back to client role
    await page.getByRole('button', { name: /switch( role)?|change role/i }).click();
    await page.getByRole('menuitem', { name: /client/i }).click();
    
    // Verify we're back on client dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('restricts access to builder pages for client users', async ({ page }) => {
    // First logout if needed
    await page.goto('/');
    
    // Login as a client-only user
    await page.getByRole('link', { name: /log in/i }).click();
    await page.getByLabel(/email/i).fill('client@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Attempt to access a builder-only page
    await page.goto('/builder');
    
    // Verify we're redirected to unauthorized page or shown error
    await expect(page).toHaveURL(/.*\/(unauthorized|access-denied|forbidden)/);
    await expect(page.getByText(/not authorized|no permission|access denied/i)).toBeVisible();
  });

  test('allows user to upload a profile picture', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    
    // Find profile picture upload button/area
    await page.getByRole('button', { name: /upload|change( picture)?|avatar/i }).click();
    
    // Upload a test image file
    await page.setInputFiles('input[type="file"]', './tests/fixtures/test-profile.jpg');
    
    // Click upload/save if there's a separate button
    const saveButton = page.getByRole('button', { name: /save|upload|update/i });
    if (await saveButton.isVisible())
      await saveButton.click();
    
    // Verify success message
    await expect(page.getByText(/picture updated|image uploaded|avatar changed/i)).toBeVisible();
    
    // Verify the image is displayed
    await expect(page.locator('img[alt*="profile"]')).toBeVisible();
  });

  test('allows user to log out', async ({ page }) => {
    // Find and click logout button (often in a dropdown menu)
    await page.getByRole('button', { name: /account|profile|menu/i }).click();
    await page.getByRole('menuitem', { name: /logout|sign out|log out/i }).click();
    
    // Verify we're logged out and redirected to home or login
    await expect(page).toHaveURL(/^\/$|\/login/);
    
    // Verify logged-out state (login button is visible)
    await expect(page.getByRole('link', { name: /log in|sign in/i })).toBeVisible();
  });
});