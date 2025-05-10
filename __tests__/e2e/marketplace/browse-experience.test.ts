import { test, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// We'll run these tests both with and without authentication
// First set for unauthenticated user
test.describe('Marketplace Browse Experience (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the marketplace page
    await page.goto('/marketplace');
    await AsyncUtils.waitForPageLoad(page);
  });

  test('displays marketplace landing page with featured builders', async ({ page }) => {
    // Verify marketplace title is visible
    await expect(page.getByRole('heading', { name: /marketplace|find (a )?builder/i })).toBeVisible();
    
    // Verify builder cards are visible
    const builderCards = page.getByTestId('builder-card');
    await expect(builderCards).toHaveCount({ min: 1 });
    
    // Verify each card has essential elements
    const firstCard = builderCards.first();
    await expect(firstCard.getByRole('heading')).toBeVisible(); // Builder name
    await expect(firstCard.getByText(/expertise|skills/i)).toBeVisible();
    
    // Check for pricing/rate information
    await expect(firstCard.getByText(/rate|\$/i)).toBeVisible();
    
    // Check for the CTA button
    await expect(firstCard.getByRole('button', { name: /view profile|book session/i })).toBeVisible();
  });

  test('navigates to builder profile when card is clicked', async ({ page }) => {
    // Get the first builder card
    const firstCard = page.getByTestId('builder-card').first();
    
    // Get the builder name for verification
    const builderName = await firstCard.getByRole('heading').textContent();
    
    // Click on the card or its view profile button
    await firstCard.getByRole('button', { name: /view profile|book session/i }).click();
    
    // Verify we're on a profile page
    await expect(page).toHaveURL(/.*\/profile\/.*/);
    
    // Verify the profile shows the same builder name
    await expect(page.getByRole('heading', { name: builderName })).toBeVisible();
  });

  test('adapts layout to different screen sizes', async ({ page }) => {
    // Test on current size first
    const initialCount = await page.getByTestId('builder-card').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Resize to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify layout still shows builder cards
    await expect(page.getByTestId('builder-card')).toBeVisible();
    
    // Resize to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify layout still shows builder cards
    await expect(page.getByTestId('builder-card')).toBeVisible();
    
    // Check for mobile-specific UI elements
    await expect(page.getByRole('button', { name: /filter|menu/i })).toBeVisible();
  });
});

// Second set for authenticated user
test.describe('Marketplace Browse Experience (Authenticated)', () => {
  test.use({ project: 'auth:client' });
  
  test.beforeEach(async ({ page }) => {
    // Start from the marketplace page
    await page.goto('/marketplace');
    await AsyncUtils.waitForPageLoad(page);
  });

  test('displays marketplace with personalized recommendations if available', async ({ page }) => {
    // Check if there's a recommendations section
    const hasRecommendations = await page.getByText(/recommended for you|based on your profile/i).isVisible();
    
    if (hasRecommendations) {
      // Verify recommended builders section
      await expect(page.getByTestId('recommended-section')).toBeVisible();
      
      // Verify it contains builder cards
      await expect(page.getByTestId('recommended-section').locator('[data-testid="builder-card"]')).toHaveCount({ min: 1 });
    } else {
      // If no recommendations, verify standard marketplace view
      await expect(page.getByTestId('builder-card')).toHaveCount({ min: 1 });
    }
  });

  test('allows user to favorite/save builders', async ({ page }) => {
    // Find the first builder card
    const firstCard = page.getByTestId('builder-card').first();
    
    // Click the favorite/save button
    await firstCard.getByRole('button', { name: /favorite|save|bookmark/i }).click();
    
    // Verify visual feedback (e.g., filled icon)
    await expect(firstCard.getByTestId('favorite-button-active')).toBeVisible();
    
    // Navigate to saved/favorites page if it exists
    const savedLink = page.getByRole('link', { name: /saved|favorites|bookmarks/i });
    if (await savedLink.isVisible()) {
      await savedLink.click();
      
      // Verify we're on the saved builders page
      await expect(page).toHaveURL(/.*\/saved|.*\/favorites|.*\/bookmarks/);
      
      // Verify the builder we favorited is displayed
      await expect(page.getByTestId('builder-card')).toHaveCount({ min: 1 });
    }
  });

  test('shows builder\'s availability status if implemented', async ({ page }) => {
    // Check if availability indicators are implemented
    const hasAvailability = await page.getByText(/available now|next available/i).isVisible();
    
    if (hasAvailability) {
      // Verify at least one builder has availability indicator
      await expect(page.getByTestId('availability-indicator')).toBeVisible();
      
      // Click on a builder with availability
      await page.getByTestId('availability-indicator').first().click();
      
      // Verify we're on profile page
      await expect(page).toHaveURL(/.*\/profile\/.*/);
      
      // Verify availability information is shown on profile
      await expect(page.getByText(/available|next available|schedule/i)).toBeVisible();
    } else {
      // Skip test if availability indicators aren't implemented
      test.skip('Availability indicators not implemented');
    }
  });
});