/**
 * Playwright global setup
 * This file is executed once before all tests
 */
import { chromium, FullConfig } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { seedTestData } from '../__tests__/utils/seed';
import { resetTestDatabase, initializeTestDatabase } from '../__tests__/utils/database';
import { PrismaClient } from '@prisma/client';
import { setupAuthStates } from '../__tests__/utils/e2e/auth-utils';

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('Running global setup for E2E tests...');
  
  // Ensure auth directory exists
  const authDir = join(process.cwd(), 'playwright', '.auth');
  await mkdir(authDir, { recursive: true });
  
  // Setup test database
  const prisma = new PrismaClient();
  
  try {
    // Check if we're in CI environment
    const isCI = process.env.CI === 'true';
    const environment = isCI ? 'ci' : 'test';

    // Initialize test database (reset and prepare)
    await initializeTestDatabase();
    
    // Reset database to clean state
    await resetTestDatabase(prisma);
    
    // Seed with test data for E2E tests
    await seedTestData({
      environment,
      domains: ['users', 'profiles', 'scheduling', 'bookings', 'payments'],
      reset: false // Already reset above
    });
    
    console.log('Test data seeding completed successfully');
  } catch (error) {
    console.error('Failed to seed test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
  
  // Setup auth states for Playwright
  const browser = await chromium.launch();
  
  try {
    const { baseURL } = config.projects[0].use;
    if (!baseURL) {
      throw new Error('baseURL is not defined in the playwright config');
    }
    
    await setupAuthStates(browser, { baseURL });
    console.log('Successfully created all authentication states');
  } catch (error) {
    console.error('Failed to setup authentication states:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('Global setup completed successfully');
}

export default globalSetup;