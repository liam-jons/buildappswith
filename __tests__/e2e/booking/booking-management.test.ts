import { test as base, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// Create a test fixture that uses the premium client authentication
const test = base.extend({
  // Use the premium client project for these tests
  storageState: process.env.CI
    ? '.auth/premium-client.json'
    : '.auth/premium-client.json'
});

test.describe('Booking Management', () => {
  test('displays list of current bookings on dashboard', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load completely
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify bookings section is visible
    await expect(page.getByText(/upcoming sessions|your bookings/i)).toBeVisible();
    
    // Verify at least one booking is displayed
    const bookingCards = page.getByTestId('booking-card');
    await expect(bookingCards).toHaveCount({ min: 1 });
    
    // Verify booking card contains expected information
    const firstBookingCard = bookingCards.first();
    await expect(firstBookingCard.getByText(/session type|booking type/i)).toBeVisible();
    await expect(firstBookingCard.getByText(/date|scheduled/i)).toBeVisible();
    await expect(firstBookingCard.getByText(/builder|with/i)).toBeVisible();
  });

  test('filters bookings by past and upcoming', async ({ page }) => {
    // Go to bookings page (if separate from dashboard)
    await page.goto('/dashboard/bookings');
    
    // Check if tab navigation exists and click on Past bookings
    const pastTab = page.getByRole('tab', { name: /past|previous|completed/i });
    if (await pastTab.isVisible()) {
      await pastTab.click();
      
      // Verify past bookings are displayed (or empty state if none)
      await expect(page.getByTestId('booking-card')
        .or(page.getByText(/no past bookings|no previous sessions/i)))
        .toBeVisible();
      
      // Switch to upcoming tab
      await page.getByRole('tab', { name: /upcoming|scheduled/i }).click();
      
      // Verify upcoming bookings are displayed
      await expect(page.getByTestId('booking-card')
        .or(page.getByText(/no upcoming bookings|no scheduled sessions/i)))
        .toBeVisible();
    } else {
      // If tabs don't exist, at least verify some bookings are shown
      await expect(page.getByTestId('booking-card')).toBeVisible();
    }
  });

  test('displays booking details when booking is clicked', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Click on first booking card
    await page.getByTestId('booking-card').first().click();
    
    // Verify booking details page is shown
    await expect(page.getByText(/booking details|session details/i)).toBeVisible();
    
    // Verify key booking information is displayed
    await expect(page.getByText(/date and time|scheduled for/i)).toBeVisible();
    await expect(page.getByText(/session type|booking type/i)).toBeVisible();
    await expect(page.getByText(/builder|with/i)).toBeVisible();
    await expect(page.getByText(/status|payment status/i)).toBeVisible();
  });

  test('allows rescheduling a booking', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Click on first booking card
    await page.getByTestId('booking-card').first().click();
    
    // Click reschedule button
    await page.getByRole('button', { name: /reschedule|change date/i }).click();
    
    // Verify rescheduling UI is shown
    await expect(page.getByText(/select a new date|reschedule session/i)).toBeVisible();
    
    // Select a new date
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').nth(1);
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Wait for time slots to load
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Select a new time slot
    const timeSlot = page.getByTestId('time-slot').nth(1);
    await AsyncUtils.ensureElementInView(timeSlot);
    await timeSlot.click();
    
    // Confirm rescheduling
    await page.getByRole('button', { name: /confirm|update|reschedule/i }).click();
    
    // Wait for rescheduling to complete
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify success message
    await expect(page.getByText(/rescheduled successfully|session updated/i)).toBeVisible();
    
    // Verify we return to booking details with updated date
    await expect(page.getByText(/booking details|session details/i)).toBeVisible();
  });

  test('allows cancellation of a booking', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Click on first booking card
    await page.getByTestId('booking-card').first().click();
    
    // Click cancel button
    await page.getByRole('button', { name: /cancel( booking| session)?/i }).click();
    
    // Confirm cancellation in dialog
    await page.getByRole('button', { name: /confirm|yes, cancel/i }).click();
    
    // Wait for cancellation to complete
    await AsyncUtils.waitForNetworkIdle(page);
    
    // Verify success message
    await expect(page.getByText(/cancelled successfully|booking cancelled/i)).toBeVisible();
    
    // Verify we return to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('displays booking receipt and payment information', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Click on first booking card
    await page.getByTestId('booking-card').first().click();
    
    // Click on view receipt or payment details button
    await page.getByRole('button', { name: /receipt|payment details|invoice/i }).click();
    
    // Verify receipt information is displayed
    await expect(page.getByText(/payment receipt|invoice|payment details/i)).toBeVisible();
    await expect(page.getByText(/payment date|transaction date/i)).toBeVisible();
    await expect(page.getByText(/amount|total/i)).toBeVisible();
    await expect(page.getByText(/payment method|card/i)).toBeVisible();
    
    // Check for transaction ID
    await expect(page.getByText(/transaction id|payment id|reference number/i)).toBeVisible();
  });

  test.skip('shows booking in builder\'s schedule', async ({ page }) => {
    // This test requires builder authentication, which would need a different fixture
    // Skipping for now until we implement better role switching

    // Go to builder dashboard
    await page.goto('/builder/schedule');
    
    // Wait for schedule to load
    await AsyncUtils.waitForPageLoad(page);
    
    // Verify bookings section exists
    await expect(page.getByText(/upcoming sessions|scheduled bookings/i)).toBeVisible();
    
    // Verify at least one booking entry is displayed
    const bookingEntries = page.getByTestId('builder-booking-entry');
    await expect(bookingEntries).toHaveCount({ min: 1 });
    
    // Verify booking contains client information
    const firstBooking = bookingEntries.first();
    await expect(firstBooking.getByText(/client|with/i)).toBeVisible();
    await expect(firstBooking.getByText(/date|time/i)).toBeVisible();
    await expect(firstBooking.getByText(/session type|booking type/i)).toBeVisible();
  });
});