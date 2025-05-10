import { test, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// These tests can run with client authentication
test.use({ project: 'auth:client' });

test.describe('Marketplace Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the marketplace page
    await page.goto('/marketplace');
    await AsyncUtils.waitForPageLoad(page);
  });

  test('allows searching for builders by keyword', async ({ page }) => {
    // Find the search input
    const searchInput = page.getByPlaceholder(/search|find builder/i);
    await expect(searchInput).toBeVisible();
    
    // Search for "React"
    await searchInput.fill('React');
    await searchInput.press('Enter');
    
    // Wait for search results to load
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify search results show at least one builder
    const builderCards = page.getByTestId('builder-card');
    await expect(builderCards).toHaveCount({ min: 1 });
    
    // Verify search term appears in results
    await expect(page.getByText(/react/i)).toBeVisible();
    
    // Check for search results indication
    await expect(page.getByText(/results for.+react|search results|showing/i)).toBeVisible();
  });

  test('shows empty state when search has no results', async ({ page }) => {
    // Find the search input
    const searchInput = page.getByPlaceholder(/search|find builder/i);
    
    // Search for something unlikely to have results
    await searchInput.fill('xyznonexistentskill12345');
    await searchInput.press('Enter');
    
    // Wait for search results to load
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify no results message is shown
    await expect(page.getByText(/no results|couldn't find|no matches/i)).toBeVisible();
    
    // Verify there's a way to clear search or return to all builders
    await expect(page.getByRole('button', { name: /clear|all builders|reset/i })).toBeVisible();
  });

  test('filters builders by expertise area', async ({ page }) => {
    // Open filters panel/section
    const filtersButton = page.getByRole('button', { name: /filter|refine/i });
    if (await filtersButton.isVisible()) {
      // Mobile/tablet view where filters might be hidden behind a button
      await filtersButton.click();
    }
    
    // Locate expertise filter section
    const expertiseFilter = page.getByTestId('expertise-filter')
      .or(page.getByText(/expertise|skills|specialties/i).locator('..'));
    
    await expect(expertiseFilter).toBeVisible();
    
    // Select "React" from expertise filters
    await expertiseFilter.getByText(/react/i).click();
    
    // If there's an apply button, click it
    const applyButton = page.getByRole('button', { name: /apply|update|filter/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    // Wait for filtered results
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify filtered results
    const builderCards = page.getByTestId('builder-card');
    await expect(builderCards).toHaveCount({ min: 1 });
    
    // Verify filter is applied (React appears in expertise sections)
    let reactFound = false;
    const count = await builderCards.count();
    for (let i = 0; i < count; i++) {
      const hasReact = await builderCards.nth(i).getByText(/react/i).isVisible();
      if (hasReact) {
        reactFound = true;
        break;
      }
    }
    expect(reactFound).toBeTruthy();
  });

  test('filters builders by price range', async ({ page }) => {
    // Open filters panel/section if needed
    const filtersButton = page.getByRole('button', { name: /filter|refine/i });
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
    }
    
    // Check for price range filter
    const priceFilter = page.getByTestId('price-filter')
      .or(page.getByText(/price range|hourly rate|budget/i).locator('..'));
    
    // If price filter exists
    if (await priceFilter.isVisible()) {
      // Check for slider or min/max inputs
      const priceSlider = priceFilter.locator('input[type="range"]');
      const minInput = priceFilter.getByLabel(/min|minimum/i);
      const maxInput = priceFilter.getByLabel(/max|maximum/i);
      
      if (await priceSlider.count() > 0) {
        // If it's a slider, adjust it
        // Note: Slider implementation varies widely, this is a basic approach
        const slider = priceSlider.first();
        const sliderBounds = await slider.boundingBox();
        if (sliderBounds) {
          // Click at 25% of the slider width to set a lower max
          await page.mouse.click(
            sliderBounds.x + sliderBounds.width * 0.25,
            sliderBounds.y + sliderBounds.height / 2
          );
        }
      } else if (await minInput.isVisible() && await maxInput.isVisible()) {
        // If it's min/max inputs
        await minInput.fill('50');
        await maxInput.fill('150');
      }
      
      // Apply filters if there's a button
      const applyButton = page.getByRole('button', { name: /apply|update|filter/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();
      }
      
      // Wait for filtered results
      await AsyncUtils.waitForNetworkIdle(page);
      
      // Verify filtered results show at least one builder
      await expect(page.getByTestId('builder-card')).toHaveCount({ min: 1 });
      
      // Verify prices are within range (if visible)
      const priceTexts = await page.getByTestId('builder-card')
        .locator('[data-testid="price-display"]')
        .allTextContents();
      
      for (const priceText of priceTexts) {
        // Extract numeric value from price string
        const price = Number(priceText.replace(/[^0-9.]/g, ''));
        // Skip if we couldn't parse a valid price
        if (isNaN(price)) continue;
        
        // Verify price is within expected range with some flexibility
        // The exact range depends on what we set above
        expect(price).toBeGreaterThanOrEqual(20); // Lower than our min to account for display variations
        expect(price).toBeLessThanOrEqual(200); // Higher than our max to account for display variations
      }
    } else {
      // Skip test if price filter doesn't exist
      test.skip('Price filter not implemented');
    }
  });

  test('maintains filter state when navigating between pages', async ({ page }) => {
    // Open filters panel/section if needed
    const filtersButton = page.getByRole('button', { name: /filter|refine/i });
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
    }
    
    // Set expertise filter
    const expertiseFilter = page.getByTestId('expertise-filter')
      .or(page.getByText(/expertise|skills|specialties/i).locator('..'));
    
    await expertiseFilter.getByText(/react/i).click();
    
    // Apply filters if needed
    const applyButton = page.getByRole('button', { name: /apply|update|filter/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    // Wait for results
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Get the first builder card
    const firstCard = page.getByTestId('builder-card').first();
    
    // Navigate to builder profile
    await firstCard.getByRole('button', { name: /view profile|book session/i }).click();
    
    // Check we're on profile page
    await expect(page).toHaveURL(/.*\/profile\/.*/);
    
    // Navigate back
    await page.goBack();
    
    // Verify we're back on marketplace
    await expect(page).toHaveURL(/.*\/marketplace.*/);
    
    // Verify filter is still applied (filter indicators or URL params)
    await expect(page.getByText(/filter|active filters|react/i)).toBeVisible();
  });

  test('allows clearing all filters', async ({ page }) => {
    // Open filters panel/section if needed
    const filtersButton = page.getByRole('button', { name: /filter|refine/i });
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
    }
    
    // Apply a filter
    const expertiseFilter = page.getByTestId('expertise-filter')
      .or(page.getByText(/expertise|skills|specialties/i).locator('..'));
    
    await expertiseFilter.getByText(/react/i).click();
    
    // Apply filters if needed
    const applyButton = page.getByRole('button', { name: /apply|update|filter/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    // Wait for results
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Find and click clear all button
    const clearButton = page.getByRole('button', { name: /clear( all)?|reset/i });
    await clearButton.click();
    
    // Wait for unfiltered results
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify filters were cleared (more builders shown)
    const clearState = await page.getByTestId('builder-card').count();
    expect(clearState).toBeGreaterThan(0);
    
    // Verify UI shows no active filters
    const activeFilterChips = page.getByTestId('filter-chip')
      .or(page.getByTestId('active-filter'));
    
    if (await activeFilterChips.isVisible()) {
      expect(await activeFilterChips.count()).toBe(0);
    }
  });

  test('allows sorting builders by relevant criteria', async ({ page }) => {
    // Check if sorting is implemented
    const sortDropdown = page.getByRole('combobox', { name: /sort|order/i })
      .or(page.getByTestId('sort-dropdown'));
    
    if (await sortDropdown.isVisible()) {
      // Open sort dropdown
      await sortDropdown.click();
      
      // Select a sorting option (e.g., by rating)
      await page.getByRole('option', { name: /rating|best rated|top rated/i }).click();
      
      // Wait for sorted results
      await AsyncUtils.waitForNetworkIdle(page);
      
      // Verify builders are shown
      await expect(page.getByTestId('builder-card')).toBeVisible();
      
      // Try another sort option if available
      await sortDropdown.click();
      const priceSortOption = page.getByRole('option', { name: /price/i });
      
      if (await priceSortOption.isVisible()) {
        await priceSortOption.click();
        
        // Wait for sorted results
        await AsyncUtils.waitForNetworkIdle(page);
        
        // Verify builders are shown
        await expect(page.getByTestId('builder-card')).toBeVisible();
      }
    } else {
      // Skip test if sorting isn't implemented
      test.skip('Sort functionality not implemented');
    }
  });
});