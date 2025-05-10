import { chromium, FullConfig } from '@playwright/test';
import { globalSetup as setupAuthStates } from '../utils/e2e-auth-utils';

/**
 * Global setup runs once before all tests.
 * Here, we create authentication states for all test users.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Launch a browser for setting up authentication
  const browser = await chromium.launch();
  
  try {
    // Create auth states for all user roles
    // Extract baseURL from the config
    const { baseURL } = config.projects[0].use;
    
    await setupAuthStates(browser, { baseURL });
    
    console.log('Successfully created all authentication states');
  } catch (error) {
    console.error('Failed to setup authentication states:', error);
    throw error;
  } finally {
    // Always close the browser
    await browser.close();
  }
}

export default globalSetup;