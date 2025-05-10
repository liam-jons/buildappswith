import { test, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// Run tests both authenticated and unauthenticated
test.describe('Builder Profile Viewing (Unauthenticated)', () => {
  test('displays builder profile with essential information', async ({ page }) => {
    // Go directly to a builder profile
    await page.goto('/profile/established-builder');
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify essential profile sections are displayed
    await expect(page.getByRole('heading').filter({ hasText: /established builder/i })).toBeVisible();
    
    // Expertise section
    await expect(page.getByText(/expertise|skills|specialties/i)).toBeVisible();
    
    // About section
    await expect(page.getByText(/about|bio|summary/i)).toBeVisible();
    
    // Rate/pricing information
    await expect(page.getByText(/rate|pricing|starting at/i)).toBeVisible();
    
    // Verify booking CTA shows login prompt for unauthenticated user
    await page.getByRole('button', { name: /book|schedule|session/i }).click();
    
    // Should show login prompt or redirect to login
    await expect(page.getByText(/log in|sign in|create an account/i)).toBeVisible();
  });

  test('displays portfolio projects if available', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Check if portfolio section exists
    const portfolioSection = page.getByText(/portfolio|projects|work/i).first();
    
    if (await portfolioSection.isVisible()) {
      // Verify portfolio items exist
      const portfolioItems = page.getByTestId('portfolio-item');
      await expect(portfolioItems).toHaveCount({ min: 1 });
      
      // Check first portfolio item
      const firstItem = portfolioItems.first();
      
      // Verify it has title
      await expect(firstItem.getByRole('heading')).toBeVisible();
      
      // Click to view details if it's interactive
      const isClickable = await firstItem.evaluate(el => {
        return window.getComputedStyle(el).cursor === 'pointer' || 
          el.tagName === 'A' || 
          el.querySelector('a, button') !== null;
      });
      
      if (isClickable) {
        await firstItem.click();
        
        // Verify project details dialog/page appears
        await expect(page.getByText(/project details|case study|challenge/i)).toBeVisible();
      }
    } else {
      // Skip test if portfolio section doesn't exist
      test.skip('Portfolio section not available for this builder');
    }
  });

  test('displays testimonials/reviews if available', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Check if testimonials section exists
    const testimonialsSection = page.getByText(/testimonials|reviews|feedback/i).first();
    
    if (await testimonialsSection.isVisible()) {
      // Verify testimonial items exist
      const testimonialItems = page.getByTestId('testimonial-item');
      await expect(testimonialItems).toHaveCount({ min: 1 });
      
      // Check first testimonial contains essential elements
      const firstTestimonial = testimonialItems.first();
      
      // Quote/content
      await expect(firstTestimonial.getByTestId('testimonial-content')).toBeVisible();
      
      // Author name
      await expect(firstTestimonial.getByTestId('testimonial-author')).toBeVisible();
      
      // If there are multiple testimonials and navigation controls
      if (await testimonialItems.count() > 1) {
        const nextButton = page.getByRole('button', { name: /next|→|>/i });
        if (await nextButton.isVisible()) {
          // Click to navigate to next testimonial
          await nextButton.click();
          
          // Verify carousel moved
          await AsyncUtils.waitForAnimationComplete(page.getByTestId('testimonial-carousel'));
        }
      }
    } else {
      // Skip test if testimonials section doesn't exist
      test.skip('Testimonials section not available for this builder');
    }
  });

  test('adapts to different screen sizes', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Test desktop view first
    await expect(page.getByRole('heading').filter({ hasText: /established builder/i })).toBeVisible();
    
    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify essential elements still visible
    await expect(page.getByRole('heading').filter({ hasText: /established builder/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /book|schedule|session/i })).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify essential elements still visible
    await expect(page.getByRole('heading').filter({ hasText: /established builder/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /book|schedule|session/i })).toBeVisible();
    
    // Verify sections stack vertically on mobile
    // This is a rough check that can be improved based on actual layout
    const headerBox = await page.getByRole('heading').filter({ hasText: /established builder/i }).boundingBox();
    const aboutBox = await page.getByText(/about|bio|summary/i).boundingBox();
    
    if (headerBox && aboutBox) {
      // On mobile, about should be below header (higher Y value)
      expect(aboutBox.y).toBeGreaterThan(headerBox.y);
    }
  });
});

// Tests for authenticated user experience
test.describe('Builder Profile Viewing (Authenticated)', () => {
  test.use({ project: 'auth:client' });

  test('allows booking directly from profile', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    await AsyncUtils.waitForPageLoad(page);
    
    // Click book button
    await page.getByRole('button', { name: /book|schedule|session/i }).click();
    
    // Verify redirect to booking page
    await expect(page).toHaveURL(/.*\/book(ing)?\/.*\/schedule/);
    
    // Verify session types are displayed
    await expect(page.getByTestId('session-type-card')).toBeVisible();
  });

  test('shows availability calendar on profile if implemented', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Check if availability calendar exists on profile
    const availabilitySection = page.getByText(/availability|schedule|calendar/i).first();
    
    if (await availabilitySection.isVisible()) {
      // Verify calendar or availability indicators exist
      await expect(page.getByTestId('availability-calendar')
        .or(page.getByTestId('availability-indicator')))
        .toBeVisible();
      
      // If interactive, try interacting with it
      const dateElement = page.getByTestId('availability-date');
      if (await dateElement.isVisible()) {
        await dateElement.first().click();
        
        // Verify time slots appear or booking flow starts
        await expect(page.getByText(/available times|time slots|book this time/i)).toBeVisible();
      }
    } else {
      // Skip test if availability calendar isn't on profile
      test.skip('Availability calendar not implemented on profile');
    }
  });

  test('allows contacting builder via message if implemented', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Check if message/contact feature exists
    const contactButton = page.getByRole('button', { name: /message|contact|send message/i });
    
    if (await contactButton.isVisible()) {
      // Click contact button
      await contactButton.click();
      
      // Verify message form appears
      await expect(page.getByText(/send message|contact form|message to builder/i)).toBeVisible();
      
      // Fill out message form
      const messageInput = page.getByLabel(/message|your message/i)
        .or(page.getByPlaceholder(/message|your message/i))
        .or(page.locator('textarea').first());
      
      await messageInput.fill('This is a test message from the E2E test suite.');
      
      // Submit message
      await page.getByRole('button', { name: /send|submit/i }).click();
      
      // Verify success feedback
      await expect(page.getByText(/message sent|sent successfully/i)).toBeVisible();
    } else {
      // Skip test if messaging isn't implemented
      test.skip('Direct messaging not implemented');
    }
  });

  test('allows saving/favoriting builder profile', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/established-builder');
    
    // Check if save/favorite feature exists
    const favoriteButton = page.getByRole('button', { name: /save|favorite|bookmark/i });
    
    if (await favoriteButton.isVisible()) {
      // Click to favorite
      await favoriteButton.click();
      
      // Verify visual feedback
      await expect(page.getByTestId('favorite-button-active')
        .or(page.getByText(/saved|favorited/i)))
        .toBeVisible();
      
      // Navigate to saved/favorites list if it exists
      const savedLink = page.getByRole('link', { name: /saved|favorites|bookmarks/i });
      if (await savedLink.isVisible()) {
        await savedLink.click();
        
        // Verify we're on the saved list
        await expect(page).toHaveURL(/.*\/saved|.*\/favorites|.*\/bookmarks/);
        
        // Verify the builder we saved is in the list
        await expect(page.getByText(/established builder/i)).toBeVisible();
      }
    } else {
      // Skip test if favoriting isn't implemented
      test.skip('Save/favorite functionality not implemented');
    }
  });
});