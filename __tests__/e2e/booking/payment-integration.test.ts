import { test, expect } from '@playwright/test';
import { AsyncUtils } from '../../utils/e2e-async-utils';

// Use the authenticated client for these tests
test.use({ project: 'auth:client' });

test.describe('Payment Integration', () => {
  test('completes Stripe checkout successfully', async ({ page }) => {
    // Navigate through booking process to payment
    await page.goto('/book/established-builder');
    
    // Select first session type
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Select first available date
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Select first available time
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Fill booking details
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a test booking for payment integration testing.');
    
    // Proceed to payment
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Fill Stripe test card details
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
    
    // Verify receipt information is available
    await expect(page.getByText(/receipt|payment details|transaction/i)).toBeVisible();
  });

  test('handles card declined errors properly', async ({ page }) => {
    // Navigate through booking process to payment
    await page.goto('/book/established-builder');
    
    // Select first session type
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Select first available date
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Select first available time
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Fill booking details
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a test booking for declined payment testing.');
    
    // Proceed to payment
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Fill Stripe test card details with a declined card
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    
    // Use Stripe's test declined card
    await cardFrame.locator('[placeholder*="Card number"]').fill('4000000000000002');
    await cardFrame.locator('[placeholder*="MM / YY"]').fill('12/25');
    await cardFrame.locator('[placeholder*="CVC"]').fill('123');
    await cardFrame.locator('[placeholder*="ZIP"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay|submit|confirm/i }).click();
    
    // Verify error message appears
    await expect(page.getByText(/card declined|payment failed|was declined/i)).toBeVisible();
    
    // Verify we remain on the payment page
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
  });

  test('handles insufficient funds errors properly', async ({ page }) => {
    // Navigate through booking process to payment
    await page.goto('/book/established-builder');
    
    // Select first session type
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Select first available date
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Select first available time
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Fill booking details
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a test booking for insufficient funds testing.');
    
    // Proceed to payment
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Fill Stripe test card details with insufficient funds card
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    
    // Use Stripe's test insufficient funds card
    await cardFrame.locator('[placeholder*="Card number"]').fill('4000000000009995');
    await cardFrame.locator('[placeholder*="MM / YY"]').fill('12/25');
    await cardFrame.locator('[placeholder*="CVC"]').fill('123');
    await cardFrame.locator('[placeholder*="ZIP"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay|submit|confirm/i }).click();
    
    // Verify error message appears
    await expect(page.getByText(/insufficient funds|not enough funds|payment failed/i)).toBeVisible();
    
    // Verify we remain on the payment page
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
  });

  test('allows returning to booking flow if payment is cancelled', async ({ page }) => {
    // Navigate through booking process to payment
    await page.goto('/book/established-builder');
    
    // Select first session type
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    
    // Select first available date
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await AsyncUtils.ensureElementInView(availableDay);
    await availableDay.click();
    
    // Select first available time
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    
    // Fill booking details
    await page.getByLabel(/project description|tell us about your project/i).fill('This is a test booking for payment cancellation testing.');
    
    // Proceed to payment
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // Verify redirect to Stripe checkout
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Find and click the back/cancel button (button text varies by Stripe implementation)
    await page.getByRole('button', { name: /back|cancel|return/i }).click();
    
    // Wait for redirect back to our booking page
    await page.waitForURL(/.*\/book(ing)?\/.*/);
    
    // Verify we're back in the booking flow
    await expect(page.getByText(/booking details|session type|calendar/i)).toBeVisible();
  });

  test('displays appropriate pricing based on session type', async ({ page }) => {
    // Go to booking page
    await page.goto('/book/established-builder');
    
    // Get all session type cards
    const sessionCards = page.getByTestId('session-type-card');
    
    // Get price text from first session type
    const firstSessionPrice = await sessionCards.first().getByText(/\$/).textContent();
    
    // Get price text from second session type (if exists)
    let secondSessionPrice = null;
    if (await sessionCards.count() > 1) {
      secondSessionPrice = await sessionCards.nth(1).getByText(/\$/).textContent();
      
      // Verify different session types have different prices (if multiple exist)
      expect(firstSessionPrice).not.toEqual(secondSessionPrice);
    }
    
    // Select first session
    await sessionCards.first().click();
    
    // Continue through to payment
    await page.getByRole('button', { name: /continue|next|select date/i }).click();
    const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
    await availableDay.click();
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /continue|next|booking details/i }).click();
    await page.getByLabel(/project description|tell us about your project/i).fill('Testing pricing display.');
    await page.getByRole('button', { name: /continue|next|payment/i }).click();
    
    // On Stripe checkout page, verify the amount matches the selected session price
    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
    
    // Extract numeric value from price strings for comparison
    const sessionPriceValue = Number(firstSessionPrice?.replace(/[^0-9.]/g, ''));
    
    // Get price on Stripe checkout page and verify it matches
    const stripePriceText = await page.getByText(/\$\d+(\.\d{2})?/).textContent();
    const stripePriceValue = Number(stripePriceText?.replace(/[^0-9.]/g, ''));
    
    // Allow for small differences due to tax or formatting
    expect(Math.abs(sessionPriceValue - stripePriceValue)).toBeLessThan(1);
  });
});