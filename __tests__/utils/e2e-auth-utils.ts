import { Page, Browser, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Types
export type UserRole = 'client' | 'premium-client' | 'new-builder' | 'established-builder' | 'admin' | 'client-builder' | 'client-builder-admin';

export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  number?: number; // For roles with multiple users (1-3)
}

// Test user definitions - Using the first user of each role type from our comprehensive test set
export const testUsers: Record<UserRole, TestUser> = {
  'client': {
    email: 'client-test1@buildappswith.com',
    password: 'TestClient123!',
    role: 'client',
    name: 'Client One',
    number: 1
  },
  'premium-client': {
    email: 'premium-client-test1@buildappswith.com',
    password: 'PremiumClient123!',
    role: 'premium-client',
    name: 'Premium One',
    number: 1
  },
  'new-builder': {
    email: 'new-builder1@buildappswith.com',
    password: 'NewBuilder123!',
    role: 'new-builder',
    name: 'New Builder1',
    number: 1
  },
  'established-builder': {
    email: 'established-builder1@buildappswith.com',
    password: 'EstablishedBuilder123!',
    role: 'established-builder',
    name: 'Established Builder1',
    number: 1
  },
  'admin': {
    email: 'admin-test1@buildappswith.com',
    password: 'AdminUser123!',
    role: 'admin',
    name: 'Admin One',
    number: 1
  },
  'client-builder': {
    email: 'client.builder-test1@buildappswith.com',
    password: 'MultiRole123!',
    role: 'client-builder',
    name: 'Dual Role1',
    number: 1
  },
  'client-builder-admin': {
    email: 'client.builder.admin-test1@buildappswith.com',
    password: 'TripleRole123!',
    role: 'client-builder-admin',
    name: 'Triple Role1',
    number: 1
  }
};

// Additional test users by number (for multiple users of the same role)
export function getTestUser(role: UserRole, number: number = 1): TestUser {
  if (number < 1 || number > 3) {
    throw new Error(`Invalid test user number: ${number}. Must be 1-3.`);
  }

  // For the primary users (number=1), return from the main record
  if (number === 1) {
    return testUsers[role];
  }

  // For additional users, construct the email pattern
  let email = '';
  let password = '';
  let name = '';

  switch (role) {
    case 'client':
      email = `client-test${number}@buildappswith.com`;
      password = 'TestClient123!';
      name = `Client ${number === 2 ? 'Two' : 'Three'}`;
      break;
    case 'premium-client':
      email = `premium-client-test${number}@buildappswith.com`;
      password = 'PremiumClient123!';
      name = `Premium ${number === 2 ? 'Two' : 'Three'}`;
      break;
    case 'new-builder':
      email = `new-builder${number}@buildappswith.com`;
      password = 'NewBuilder123!';
      name = `New Builder${number}`;
      break;
    case 'established-builder':
      email = `established-builder${number}@buildappswith.com`;
      password = 'EstablishedBuilder123!';
      name = `Established Builder${number}`;
      break;
    case 'admin':
      email = `admin-test${number}@buildappswith.com`;
      password = 'AdminUser123!';
      name = `Admin ${number === 2 ? 'Two' : 'Three'}`;
      break;
    case 'client-builder':
      email = `client.builder-test${number}@buildappswith.com`;
      password = 'MultiRole123!';
      name = `Dual Role${number}`;
      break;
    case 'client-builder-admin':
      email = `client.builder.admin-test${number}@buildappswith.com`;
      password = 'TripleRole123!';
      name = `Triple Role${number}`;
      break;
  }

  return {
    email,
    password,
    role,
    name,
    number
  };
};

// Authentication utilities
export class AuthUtils {
  private static AUTH_DIR = path.join(process.cwd(), '.auth');

  /**
   * Ensures the .auth directory exists
   */
  private static ensureAuthDir(): void {
    if (!fs.existsSync(this.AUTH_DIR)) {
      fs.mkdirSync(this.AUTH_DIR, { recursive: true });
    }
  }

  /**
   * Get the storage state path for a given user role
   */
  public static getStorageStatePath(role: UserRole): string {
    this.ensureAuthDir();
    return path.join(this.AUTH_DIR, `${role}.json`);
  }

  /**
   * Sign in a user and save the authentication state
   */
  public static async signInUser(
    page: Page,
    userRole: UserRole,
    options: { baseURL?: string } = {}
  ): Promise<void> {
    const user = testUsers[userRole];
    if (!user) {
      throw new Error(`Unknown user role: ${userRole}`);
    }

    // Navigate to the login page
    await page.goto(`${options.baseURL || ''}/login`);

    // Debug information
    console.log('Attempting to sign in user:', user.email);

    try {
      // Wait for the page to load completely
      await page.waitForLoadState('networkidle');

      // First try the Clerk-specific selectors
      try {
        // Look for Clerk-specific email input
        await page.locator('#identifier-field, input[name="identifier"]').fill(user.email);
        console.log('Filled email with Clerk selector');

        // Try to find and click the continue button (Clerk's first step)
        const continueButton = page.locator('button.cl-formButtonPrimary, button.cl-formButton--button, button[data-testid="submit-button"]');
        if (await continueButton.isVisible()) {
          await continueButton.click();
          console.log('Clicked continue button');
          // Wait for transition or password field to appear
          await page.waitForTimeout(1000);
        }

        // Now look for password field with Clerk-specific selectors
        const passwordField = page.locator('#password-field, input[name="password"], input[type="password"]');
        await passwordField.fill(user.password);
        console.log('Filled password with Clerk selector');

        // Click sign in button
        await page.locator('button[type="submit"], button.cl-formButtonPrimary, button[data-testid="submit-button"]').click();
        console.log('Clicked submit button');
      } catch (clerkError) {
        console.log('Clerk-specific selectors failed, trying generic ones:', clerkError);

        // Fallback to more generic selectors
        // Fill email
        await page.getByLabel(/email/i).fill(user.email);
        console.log('Filled email with generic label selector');

        // Fill password
        await page.locator('input[type="password"]').fill(user.password);
        console.log('Filled password with generic type selector');

        // Click submit
        await page.locator('button[type="submit"]').click();
        console.log('Clicked generic submit button');
      }

      // Wait for navigation to complete
      console.log('Waiting for navigation to complete...');
      await page.waitForURL(/.*\/(dashboard|profile|builder|admin)/, { timeout: 10000 });
      console.log('Navigation completed successfully');
    } catch (error) {
      console.error('Error during sign in:', error);

      // Take screenshot for debugging
      await page.screenshot({ path: `auth-error-${userRole}.png` });

      // Capture HTML for debugging
      const html = await page.content();
      console.log('Current page HTML structure:', html.substring(0, 500) + '...');

      throw error;
    }
  }

  /**
   * Create authentication state for a user role
   */
  public static async createAuthState(
    browser: Browser,
    userRole: UserRole,
    options: { baseURL?: string } = {}
  ): Promise<void> {
    // Create a new browser context
    const context = await browser.newContext({
      baseURL: options.baseURL,
    });
    
    // Create a new page
    const page = await context.newPage();
    
    try {
      // Sign in the user
      await this.signInUser(page, userRole, options);
      
      // Save the storage state
      await context.storageState({ 
        path: this.getStorageStatePath(userRole) 
      });
      
      console.log(`Created auth state for ${userRole}`);
    } finally {
      // Close context to clean up
      await context.close();
    }
  }

  /**
   * Create authentication states for all user roles
   * @param includeAllUsers When true, creates auth states for all user numbers (1-3) for each role
   */
  public static async createAllAuthStates(
    browser: Browser,
    options: { baseURL?: string; includeAllUsers?: boolean } = {}
  ): Promise<void> {
    this.ensureAuthDir();

    // Create auth state for primary user of each role
    for (const role of Object.keys(testUsers) as UserRole[]) {
      await this.createAuthState(browser, role, options);

      // If includeAllUsers is true, create auth states for users 2 and 3 of each role
      if (options.includeAllUsers) {
        for (let num = 2; num <= 3; num++) {
          try {
            const user = getTestUser(role, num);
            // Create a custom storage path for numbered users
            const storagePath = this.getStorageStatePath(`${role}-${num}`);

            // Create a context for this user
            const context = await browser.newContext({
              baseURL: options.baseURL,
            });

            // Create a page
            const page = await context.newPage();

            try {
              // Navigate to login page
              await page.goto(`${options.baseURL || ''}/login`);

              // Use the same robust sign-in method
              try {
                // Look for Clerk-specific email input
                await page.locator('#identifier-field, input[name="identifier"]').fill(user.email);

                // Try to find and click the continue button (Clerk's first step)
                const continueButton = page.locator('button.cl-formButtonPrimary, button.cl-formButton--button, button[data-testid="submit-button"]');
                if (await continueButton.isVisible()) {
                  await continueButton.click();
                  // Wait for transition or password field to appear
                  await page.waitForTimeout(1000);
                }

                // Now look for password field with Clerk-specific selectors
                const passwordField = page.locator('#password-field, input[name="password"], input[type="password"]');
                await passwordField.fill(user.password);

                // Click sign in button
                await page.locator('button[type="submit"], button.cl-formButtonPrimary, button[data-testid="submit-button"]').click();
              } catch (clerkError) {
                // Fallback to more generic selectors
                await page.getByLabel(/email/i).fill(user.email);
                await page.locator('input[type="password"]').fill(user.password);
                await page.locator('button[type="submit"]').click();
              }

              // Wait for navigation to complete
              await page.waitForURL(/.*\/(dashboard|profile|builder|admin)/);

              // Save storage state
              await context.storageState({ path: storagePath });

              console.log(`Created auth state for ${role}-${num}`);
            } finally {
              await context.close();
            }
          } catch (error) {
            console.error(`Error creating auth state for ${role}-${num}:`, error);
          }
        }
      }
    }
  }

  /**
   * Helper to log in to a specific page without using storage state
   */
  public static async loginUser(
    page: Page,
    userRole: UserRole
  ): Promise<void> {
    await this.signInUser(page, userRole);
  }

  /**
   * Logout the currently logged in user
   */
  public static async logoutUser(page: Page): Promise<void> {
    // Find and click logout button (often in a dropdown menu)
    await page.getByRole('button', { name: /account|profile|menu/i }).click();
    await page.getByRole('menuitem', { name: /logout|sign out|log out/i }).click();
    
    // Wait to be redirected to home or login
    await page.waitForURL(/^\/$|\/login/);
  }
}

/**
 * Global setup function to create auth states for all test users
 */
export async function globalSetup(
  browser: Browser, 
  options: { baseURL?: string } = {}
): Promise<void> {
  await AuthUtils.createAllAuthStates(browser, options);
}

/**
 * Switch user role in a test with an existing multi-role user
 */
export async function switchToRole(
  page: Page,
  targetRole: 'client' | 'builder' | 'admin'
): Promise<void> {
  try {
    // Find and click the role switcher
    await page.getByRole('button', { name: /switch( role)?|change role/i }).click({ timeout: 2000 });

    // Select the target role
    await page.getByRole('menuitem', { name: new RegExp(targetRole, 'i') }).click();

    // Wait for navigation to complete based on the role
    switch(targetRole) {
      case 'client':
        await page.waitForURL(/.*\/dashboard/);
        break;
      case 'builder':
        await page.waitForURL(/.*\/builder/);
        break;
      case 'admin':
        await page.waitForURL(/.*\/admin/);
        break;
    }
  } catch (error) {
    console.error(`Error switching to role ${targetRole}:`, error);
    throw new Error(`Failed to switch to role ${targetRole}. Make sure you're using a multi-role user.`);
  }
}

/**
 * Get a specific user for testing by role and number
 */
export function getNumberedTestUser(role: UserRole, number: 1 | 2 | 3): TestUser {
  return getTestUser(role, number);
}

/**
 * Get the storage state path for a numbered user
 */
export function getNumberedStorageStatePath(role: UserRole, number: 1 | 2 | 3): string {
  if (number === 1) {
    return AuthUtils.getStorageStatePath(role);
  }
  return AuthUtils.getStorageStatePath(`${role}-${number}`);
}