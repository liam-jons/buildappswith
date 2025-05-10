/**
 * E2E authentication utilities for Playwright tests
 */
import { Browser, BrowserContext, Page } from '@playwright/test';
import { TestPersona } from '../models';

/**
 * Authentication options for E2E tests
 */
export interface AuthOptions {
  baseURL?: string;
  storageState?: string;
}

/**
 * Setup authentication states for different user personas
 * Creates auth state files that can be used by Playwright tests
 */
export async function setupAuthStates(
  browser: Browser, 
  options: AuthOptions
): Promise<void> {
  console.log('Setting up authentication states for E2E tests...');
  
  // Create auth states for each persona
  await setupAuthState(browser, TestPersona.CLIENT_BASIC, options);
  await setupAuthState(browser, TestPersona.BUILDER_EXPERIENCED, options);
  await setupAuthState(browser, TestPersona.ADMIN_SUPER, options);
  
  console.log('Auth states created successfully');
}

/**
 * Set up authentication state for a specific persona
 */
async function setupAuthState(
  browser: Browser,
  persona: TestPersona,
  options: AuthOptions
): Promise<void> {
  console.log(`Setting up auth state for ${persona}...`);
  
  // Create a new context for this auth session
  const context = await browser.newContext({
    baseURL: options.baseURL
  });
  
  // Get page from context
  const page = await context.newPage();
  
  try {
    // Depending on the persona, get the auth credentials
    const credentials = getCredentialsForPersona(persona);
    
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be ready
    await page.waitForSelector('input[type="email"]');
    
    // Fill in login form
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for successful login (adjust according to your application)
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Check if login was successful
    const url = page.url();
    if (url.includes('login') || url.includes('error')) {
      throw new Error(`Login failed for ${persona}`);
    }
    
    // Store auth state to a file
    const storageStatePath = `./playwright/.auth/${persona.toLowerCase()}.json`;
    await context.storageState({ path: storageStatePath });
    
    console.log(`Auth state stored for ${persona} at ${storageStatePath}`);
  } catch (error) {
    console.error(`Failed to set up auth state for ${persona}:`, error);
    throw error;
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * Get test credentials for a specific persona
 */
function getCredentialsForPersona(persona: TestPersona): { email: string; password: string } {
  switch (persona) {
    case TestPersona.CLIENT_BASIC:
      return {
        email: 'basic-client@example.com',
        password: 'Password123!'  // Use environment variables in production
      };
    
    case TestPersona.CLIENT_PREMIUM:
      return {
        email: 'premium-client@example.com',
        password: 'Password123!'
      };
    
    case TestPersona.BUILDER_NEW:
      return {
        email: 'new-builder@example.com',
        password: 'Password123!'
      };
    
    case TestPersona.BUILDER_EXPERIENCED:
      return {
        email: 'experienced-builder@example.com',
        password: 'Password123!'
      };
    
    case TestPersona.ADMIN_SUPER:
      return {
        email: 'super-admin@example.com',
        password: 'Password123!'
      };
    
    default:
      throw new Error(`No credentials defined for persona: ${persona}`);
  }
}

/**
 * Helper to get authenticated page for a specific persona
 */
export async function getAuthenticatedPage(
  context: BrowserContext,
  persona: TestPersona
): Promise<Page> {
  // Use stored auth state
  const storageStatePath = `./playwright/.auth/${persona.toLowerCase()}.json`;
  
  // Create new context with auth state
  const authenticatedContext = await context.browser().newContext({
    storageState: storageStatePath,
    baseURL: context.options().baseURL
  });
  
  // Create new page in authenticated context
  return await authenticatedContext.newPage();
}