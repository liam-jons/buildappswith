/**
 * Project fixtures for E2E tests
 * 
 * This file provides fixtures for setting up test environments
 * including authentication, feature flags, and database isolation.
 */
import { test as base } from '@playwright/test';
import { TestPersona } from '../../utils/models';
import { 
  withE2EIsolation, 
  setupE2EDatabase, 
  createE2EDataFactory 
} from '../utils/database-isolation';
import { loginAsTestUser } from '../utils/test-data-helpers';

// Define custom test fixtures
export const test = base.extend({
  /**
   * Authenticated page for a specific persona
   */
  authenticatedPage: async ({ page }, use, testInfo) => {
    const persona = TestPersona.CLIENT_BASIC; // Default to basic client
    
    // Log in the user
    await loginAsTestUser(page, persona);
    
    // Use the authenticated page
    await use(page);
  },
  
  /**
   * Builder authenticated page
   */
  builderPage: async ({ page }, use) => {
    // Log in as builder
    await loginAsTestUser(page, TestPersona.BUILDER_EXPERIENCED);
    
    // Use the authenticated page
    await use(page);
  },
  
  /**
   * Admin authenticated page
   */
  adminPage: async ({ page }, use) => {
    // Log in as admin
    await loginAsTestUser(page, TestPersona.ADMIN_SUPER);
    
    // Use the authenticated page
    await use(page);
  },
  
  /**
   * Factory for creating test data
   */
  dataFactory: async ({}, use, testInfo) => {
    // Use isolated database for this test
    await withE2EIsolation(async (db) => {
      // Create data factory
      const factory = createE2EDataFactory(db);
      
      // Use the factory
      await use(factory);
    }, {
      testRunId: testInfo.testId,
      useIsolatedSchema: true
    });
  }
});

// Export types
export { expect } from '@playwright/test';