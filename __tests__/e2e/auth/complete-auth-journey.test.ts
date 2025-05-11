/**
 * Complete Authentication User Journey Test
 * 
 * Tests the entire authentication flow including:
 * - Signup process
 * - Onboarding
 * - Profile creation
 * - Login
 * - Account management
 */
import { test, expect } from '@playwright/test';
import { 
  AuthPage, 
  ProfilePage, 
  OnboardingPage 
} from '../page-objects';
import { withE2EIsolation } from '../utils/database-isolation';
import { setFeatureFlag, withFeatureFlag } from '../utils/feature-flag-utils';

// Generate unique test credentials for each run
const testEmail = `test-user-${Date.now()}@buildappswith-test.com`;
const testPassword = 'SecurePassword123!';
const testName = 'Test User';

test.describe('Authentication User Journey', () => {
  test('complete signup to login flow', async ({ page }) => {
    // Ensure Clerk authentication is enabled
    await setFeatureFlag(page, 'UseClerkAuth', true);
    
    // Initialize page objects
    const authPage = new AuthPage(page);
    const onboardingPage = new OnboardingPage(page);
    const profilePage = new ProfilePage(page);
    
    // Part 1: User signup
    await test.step('User signup', async () => {
      // Go to signup page
      await authPage.navigateToSignup();
      await expect(page).toHaveURL(/.*\/signup/);
      
      // Fill signup form and submit
      await authPage.signup(testName, testEmail, testPassword);
      
      // Should redirect to onboarding
      await expect(page).toHaveURL(/.*\/onboarding/);
    });
    
    // Part 2: Complete onboarding
    await test.step('Onboarding process', async () => {
      // Select "client" role
      await onboardingPage.selectRole('client');
      
      // Complete profile with minimal details
      await onboardingPage.completeProfile({
        bio: 'This is a test profile created during E2E testing'
      });
      
      // Should redirect to dashboard after onboarding
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
    
    // Part 3: Verify profile created correctly
    await test.step('Profile verification', async () => {
      // Go to profile page
      await profilePage.navigateToProfile();
      
      // Verify profile data is present
      const profileData = await profilePage.getProfileData();
      expect(profileData.bio).toContain('E2E testing');
      
      // Verify user name appears
      await expect(page.getByText(testName)).toBeVisible();
    });
    
    // Part 4: Logout user
    await test.step('User logout', async () => {
      await authPage.logout();
      
      // Should redirect to login page after logout
      await expect(page).toHaveURL(/.*\/(login|homepage)/);
      
      // Verify user is logged out
      expect(await authPage.isLoggedIn()).toBeFalsy();
    });
    
    // Part 5: Login with newly created account
    await test.step('User login', async () => {
      // Go to login page
      await authPage.navigateToLogin();
      
      // Fill login form and submit
      await authPage.login(testEmail, testPassword);
      
      // Should redirect to dashboard after login
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Verify user is logged in
      expect(await authPage.isLoggedIn()).toBeTruthy();
    });
  });
  
  test('login with invalid credentials shows error', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    // Go to login page
    await authPage.navigateToLogin();
    
    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Should show error message
    const errorMessage = await authPage.getAuthError();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain(/invalid|incorrect|failed/i);
  });
  
  test('protected routes require authentication', async ({ page }) => {
    // Try to access protected routes without auth
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.url()).toContain('returnUrl');
    
    // Try builder routes
    await page.goto('/builder-dashboard');
    await expect(page).toHaveURL(/.*\/login/);
    
    // Try admin routes
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('role-based access control', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Create client test user
      const user = await db.user.create({
        data: {
          id: `user-${Date.now()}`,
          name: 'Client Test',
          email: `client-${Date.now()}@test.com`,
          clerkId: `user_test_${Date.now()}`,
          role: 'CLIENT',
          emailVerified: new Date()
        }
      });
      
      // Set up auth state
      const authPage = new AuthPage(page);
      await authPage.navigateToLogin();
      await authPage.login(user.email, 'Password123!'); // Test password
      
      // Client should not access builder areas
      await page.goto('/builder-dashboard');
      
      // Should show access denied or redirect to dashboard
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/dashboard') || 
        currentUrl.includes('/access-denied') || 
        currentUrl.includes('/unauthorized')
      ).toBeTruthy();
      
      // Client should not access admin areas
      await page.goto('/admin');
      const adminUrl = page.url();
      expect(
        adminUrl.includes('/dashboard') || 
        adminUrl.includes('/access-denied') || 
        adminUrl.includes('/unauthorized')
      ).toBeTruthy();
    });
  });
});