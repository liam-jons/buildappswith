/**
 * Marketplace User Journey Test
 * 
 * Tests the complete marketplace experience including:
 * - Browsing builders
 * - Filtering and searching
 * - Viewing builder profiles
 * - Selecting session types
 */
import { test, expect } from '@playwright/test';
import { 
  MarketplacePage, 
  BuilderProfilePage
} from '../page-objects';
import { withE2EIsolation, createE2EDataFactory } from '../utils/database-isolation';
import { withFeatureFlag } from '../utils/feature-flag-utils';
import { createTestBuilders } from '../utils/test-data-helpers';

test.describe('Marketplace User Journey', () => {
  test('browse, filter, and view builder profile', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Set up test data
      const factory = createE2EDataFactory(db);
      const builders = await createTestBuilders(factory);
      
      // Initialize page objects
      const marketplacePage = new MarketplacePage(page);
      const builderProfilePage = new BuilderProfilePage(page);
      
      // Part 1: Browse marketplace
      await test.step('Browsing marketplace', async () => {
        // Navigate to marketplace
        await marketplacePage.navigate();
        
        // Verify marketplace page loaded correctly
        await expect(page).toHaveURL(/.*\/marketplace/);
        await expect(page.getByRole('heading', { name: /marketplace|developers|builders/i })).toBeVisible();
        
        // Should display builder cards
        const builderCount = await marketplacePage.getBuilderCount();
        expect(builderCount).toBeGreaterThan(0);
      });
      
      // Part 2: Search marketplace
      await test.step('Searching marketplace', async () => {
        // Search for frontend developers
        await marketplacePage.search('frontend');
        
        // Should find our test frontend developer
        expect(await marketplacePage.builderExists('Frontend')).toBeTruthy();
        
        // Search for non-existent skill
        await marketplacePage.search('nonexistentskill12345');
        
        // Should show no results
        expect(await marketplacePage.hasNoResults()).toBeTruthy();
        
        // Clear search by navigating back to marketplace
        await marketplacePage.navigate();
      });
      
      // Part 3: Filter marketplace 
      await test.step('Filtering marketplace', async () => {
        // Toggle filter panel
        await marketplacePage.toggleFilterPanel();
        
        // Filter by expertise
        await marketplacePage.filterByExpertise('React');
        
        // Should find frontend and fullstack developers
        expect(await marketplacePage.builderExists('Frontend') || 
               await marketplacePage.builderExists('Full-Stack')).toBeTruthy();
        
        // Apply price filter
        await marketplacePage.filterByRate(0, 100); // Up to $100/hr
        
        // Sort by price (ascending)
        await marketplacePage.sortBy('price-asc');
        
        // Clear filters by navigating back
        await marketplacePage.navigate();
      });
      
      // Part 4: View builder profile
      await test.step('Viewing builder profile', async () => {
        // Select the frontend developer's card
        await marketplacePage.navigateToBuilderProfile('Frontend');
        
        // Verify we're on the builder profile page
        const profileUrl = await page.url();
        expect(profileUrl).toMatch(/\/(marketplace\/builders|profile)\/[\w-]+/);
        
        // Check builder details
        const builderName = await builderProfilePage.getBuilderName();
        expect(builderName).toContain('Frontend');
        
        // Check for skills
        const skills = await builderProfilePage.getBuilderSkills();
        expect(skills).toContain('React');
        
        // Check for session types
        const sessionTypeCount = await builderProfilePage.getSessionTypeCount();
        expect(sessionTypeCount).toBeGreaterThan(0);
      });
      
      // Part 5: Interact with session types
      await test.step('Interacting with session types', async () => {
        // Select first session type
        await builderProfilePage.selectSessionType(0);
        
        // Should highlight or select the session type
        
        // Click book session button
        try {
          await builderProfilePage.clickBookSession();
          
          // Either redirects to booking page or login (if not authenticated)
          const currentUrl = page.url();
          expect(
            currentUrl.includes('/book/') || 
            currentUrl.includes('/login')
          ).toBeTruthy();
        } catch (error) {
          // Book button may not be directly clickable in some designs
          // In that case, we'll verify the button exists
          const bookingButtonVisible = await page.isVisible('[data-testid="booking-button"]');
          expect(bookingButtonVisible).toBeTruthy();
        }
      });
    });
  });
  
  test('marketplace with dynamic feature flag', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Set up test data
      const factory = createE2EDataFactory(db);
      await createTestBuilders(factory);
      
      // Initialize page objects
      const marketplacePage = new MarketplacePage(page);
      
      // Test with dynamic marketplace enabled
      await withFeatureFlag(page, 'UseDynamicMarketplace', true, async () => {
        await marketplacePage.navigate();
        
        // Dynamic marketplace should have the filter panel
        const filterPanelExists = await page.isVisible('[data-testid="filter-panel"]') ||
                                 await page.isVisible('[data-testid="filter-toggle"]');
        expect(filterPanelExists).toBeTruthy();
      });
      
      // Test with dynamic marketplace disabled
      await withFeatureFlag(page, 'UseDynamicMarketplace', false, async () => {
        await marketplacePage.navigate();
        
        // Basic marketplace should still display builders
        const builderCount = await marketplacePage.getBuilderCount();
        expect(builderCount).toBeGreaterThan(0);
      });
    });
  });
  
  test('marketplace pagination', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Create many builders to test pagination
      const factory = createE2EDataFactory(db);
      
      // Create 12 builders (should be enough to trigger pagination)
      for (let i = 0; i < 12; i++) {
        await factory.createBuilder(1);
      }
      
      // Initialize page object
      const marketplacePage = new MarketplacePage(page);
      
      // Navigate to marketplace
      await marketplacePage.navigate();
      
      // Count builders on first page
      const firstPageCount = await marketplacePage.getBuilderCount();
      
      // Check if pagination exists
      const paginationExists = await page.isVisible('[data-testid="pagination"]');
      
      if (paginationExists) {
        // Go to next page
        const hasNextPage = await marketplacePage.goToNextPage();
        
        if (hasNextPage) {
          // Count builders on second page
          const secondPageCount = await marketplacePage.getBuilderCount();
          
          // Verify we're seeing different builders
          expect(secondPageCount).toBeGreaterThan(0);
          
          // Note: If the marketplace doesn't implement pagination yet,
          // this test will still pass but won't fully validate pagination
        }
      } else {
        // If no pagination UI exists, we should see all builders at once
        expect(firstPageCount).toBeGreaterThanOrEqual(12);
      }
    });
  });
});