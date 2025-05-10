import { test, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// Use the authenticated client project for these tests
test.use({ project: 'auth:client' });

test.describe('Booking Journey', () => {
  test('completes full booking flow from builder profile to confirmation', async ({ page }) => {
    // Go to a specific builder's profile
    await page.goto('/profile/established-builder');
    
    // Wait for profile page to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Click the booking button
    await page.getByTestId('booking-button').click();
    
    // Verify we're on the booking page with session types
    await expect(page).toHaveURL(/.*\/book(ing)?\/.*\/schedule/);
    await expect(page.getByText(/choose a session/i)).toBeVisible();
    
    // Select the first session type
    const sessionTypeCard = page.getByTestId('session-type-card').first();
    await AsyncUtils.ensureElementInView(sessionTypeCard);
    await sessionTypeCard.click();
    
    // Verify session type selection was successful
    await expect(page.getByTestId('selected-session-badge')).toBeVisible();
    
    // Continue to calendar view
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Verify calendar is displayed
    await expect(page.getByTestId('booking-calendar')).toBeVisible();
    
    // Select a date (first available date)
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Wait for time slots to load
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Select the first available time slot
    const timeSlot = page.getByTestId('time-slot').first();
    await AsyncUtils.ensureElementInView(timeSlot);
    await timeSlot.click();
    
    // Continue to booking details
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Verify booking form is displayed
    await expect(page.getByText(/booking details|project details/i)).toBeVisible();
    
    // Fill out booking form
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a test booking from the E2E test suite.');
    
    if (await page.getByLabel(/name/i).isVisible()) {
      await page.getByLabel(/name/i).fill('Test Client');
    }
    
    // Continue to payment
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Fill out Stripe test card details in the iframe
    // Get Stripe iframe (may need adjustment based on actual Stripe integration)
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    
    // Fill card details with Stripe test card
    await cardFrame.locator('[placeholder*="Card number"]').fill('4242424242424242');
    await cardFrame.locator('[placeholder*="MM / YY"]').fill('12/25');
    await cardFrame.locator('[placeholder*="CVC"]').fill('123');
    await cardFrame.locator('[placeholder*="ZIP"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay|submit|confirm/i }).click();
    
    // Wait for redirect back to our site
    await page.waitForURL(/.*\/booking\/confirmation.*/);
    
    // Verify booking confirmation
    await expect(page.getByText(/booking confirmed|thank you for your booking/i)).toBeVisible();
    await expect(page.getByText(/booking reference|confirmation number/i)).toBeVisible();
  });

  test('displays appropriate session types for selected builder', async ({ page }) => {
    // Go to a specific builder's profile
    await page.goto('/profile/established-builder');
    
    // Click the booking button
    await page.getByTestId('booking-button').click();
    
    // Verify multiple session types are displayed
    const sessionCards = page.getByTestId('session-type-card');
    await expect(sessionCards).toHaveCount({ min: 1 });
    
    // Verify session details are displayed
    await expect(sessionCards.first().getByText(/duration/i)).toBeVisible();
    await expect(sessionCards.first().getByText(/price/i)).toBeVisible();
    await expect(sessionCards.first().getByText(/\$/)).toBeVisible();
  });

  test('shows available time slots based on builder availability', async ({ page }) => {
    // Go to booking page directly
    await page.goto('/book/established-builder');
    
    // Select the first session type
    await page.getByTestId('session-type-card').first().click();
    
    // Continue to calendar
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Verify calendar is displayed with available dates
    const availableDays = page.locator('.calendar-day:not(.calendar-day-disabled)');
    await expect(availableDays).toHaveCount({ min: 1 });
    
    // Select first available date
    await availableDays.first().click();
    
    // Verify time slots are shown
    const timeSlots = page.getByTestId('time-slot');
    await expect(timeSlots).toHaveCount({ min: 1 });
    
    // Check for time slot format (e.g., "10:00 AM")
    await expect(timeSlots.first()).toContainText(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/);
  });

  test('validates booking form fields properly', async ({ page }) => {
    // Navigate through booking flow to form
    await page.goto('/book/established-builder');
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await availableDay.click();
    
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Submit form without filling required fields
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify validation error for project description
    await expect(page.getByText(/project description is required|please fill out this field/i)).toBeVisible();
    
    // Fill out with too short text
    await page.getByLabel(/project description|tell us about your project/i).fill('Too short');
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify validation for minimum length
    await expect(page.getByText(/description (is )?too short|minimum/i)).toBeVisible();
    
    // Fill out properly
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a proper project description that meets the minimum length requirements for the booking form validation.');
    
    // Now form should proceed
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify we moved to payment step
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*|.*\/payment.*/);
  });

  test('allows booking cancellation before payment', async ({ page }) => {
    // Navigate through booking flow to payment
    await page.goto('/book/established-builder');
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await availableDay.click();
    
    await page.getByTestId('time-slot').first().click();
    
    // Click the cancel button
    await page.getByRole('button', { name: /cancel|back/i }).click();
    
    // Verify we're back at session selection
    await expect(page).toHaveURL(/.*\/book(ing)?\/.*\/schedule/);
    await expect(page.getByTestId('session-type-card')).toBeVisible();
  });

  test('handles timezone selection properly', async ({ page }) => {
    // Go to booking page
    await page.goto('/book/established-builder');
    
    // Check if timezone selector is available
    const timezoneSelector = page.getByTestId('timezone-selector');
    if (await timezoneSelector.isVisible()) {
      // Open timezone selector
      await timezoneSelector.click();
      
      // Select a different timezone
      await page.getByRole('option', { name: /pacific|eastern|central|mountain/i }).first().click();
      
      // Proceed with booking
      await page.getByTestId('session-type-card').first().click();
      await page.getByRole('button', { name: /continue|next|select date/i }).click();
      
      // Select a date
      const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
      await availableDay.click();
      
      // Verify time slots show the selected timezone
      const selectedTimezone = await timezoneSelector.textContent();
      await expect(page.getByText(new RegExp(`times shown in.*${selectedTimezone}`, 'i'))).toBeVisible();
    } else {
      // Skip test if timezone selector isn't part of the UI
      test.skip('Timezone selector not found in the UI');
    }
  });
});