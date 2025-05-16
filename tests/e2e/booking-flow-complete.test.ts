/**
 * End-to-End Booking Flow Test
 * 
 * This test verifies the complete booking flow from marketplace to confirmation,
 * including payment processing and email notifications.
 */

import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'https://www.buildappswith.ai',
  testUser: {
    email: 'test@buildappswith.com',
    password: 'TestPassword123!'
  },
  testBuilder: {
    id: 'clw0d5lfz0000131ydghkstd9', // Liam's builder ID
    name: 'Liam Johnson'
  },
  stripeTestCard: {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123'
  }
};

test.describe('Complete Booking Flow', () => {
  test.setTimeout(120000); // 2 minutes timeout for complete flow
  
  test('Anonymous user books free session', async ({ page }) => {
    // 1. Navigate to marketplace
    await page.goto('/marketplace');
    await expect(page.locator('h1')).toContainText('Find Your Builder');
    
    // 2. Search for specific builder
    await page.fill('input[placeholder*="Search"]', TEST_CONFIG.testBuilder.name);
    await page.waitForTimeout(1000); // Wait for search debounce
    
    // 3. Click on builder card
    await page.click(`[data-builder-id="${TEST_CONFIG.testBuilder.id}"]`);
    await page.waitForURL(`/marketplace/builders/${TEST_CONFIG.testBuilder.id}`);
    
    // 4. Verify builder profile loaded
    await expect(page.locator('h1')).toContainText(TEST_CONFIG.testBuilder.name);
    await expect(page.locator('[data-testid="session-types"]')).toBeVisible();
    
    // 5. Select free session type
    const freeSessionCard = page.locator('[data-session-category="FREE"]').first();
    await expect(freeSessionCard).toBeVisible();
    await freeSessionCard.click();
    
    // 6. Wait for Calendly or booking calendar to load
    await page.waitForSelector('[data-testid="booking-calendar"]', { timeout: 10000 });
    
    // 7. Select available time slot (first available)
    const availableSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
    await expect(availableSlot).toBeVisible();
    await availableSlot.click();
    
    // 8. Fill booking form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    
    // 9. Confirm booking
    await page.click('button[data-testid="confirm-booking"]');
    
    // 10. Wait for confirmation page
    await page.waitForURL(/\/booking\/confirmation/);
    
    // 11. Verify confirmation
    await expect(page.locator('h1')).toContainText('Booking Confirmed');
    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
    
    // 12. Verify booking details
    const bookingDetails = page.locator('[data-testid="booking-details"]');
    await expect(bookingDetails).toContainText('Free Session');
    await expect(bookingDetails).toContainText(TEST_CONFIG.testBuilder.name);
    
    logger.info('Anonymous free session booking completed successfully');
  });
  
  test('Authenticated user books paid session', async ({ page }) => {
    // 1. Log in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_CONFIG.testUser.email);
    await page.fill('input[name="password"]', TEST_CONFIG.testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect after login
    await page.waitForURL('/dashboard');
    
    // 2. Navigate to marketplace
    await page.goto('/marketplace');
    await expect(page.locator('h1')).toContainText('Find Your Builder');
    
    // 3. Select builder
    await page.click(`[data-builder-id="${TEST_CONFIG.testBuilder.id}"]`);
    await page.waitForURL(`/marketplace/builders/${TEST_CONFIG.testBuilder.id}`);
    
    // 4. Select paid session type
    const paidSessionCard = page.locator('[data-session-category="SPECIALIZED"]').first();
    await expect(paidSessionCard).toBeVisible();
    await paidSessionCard.click();
    
    // 5. Wait for calendar to load
    await page.waitForSelector('[data-testid="booking-calendar"]', { timeout: 10000 });
    
    // 6. Select time slot
    const availableSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
    await availableSlot.click();
    
    // 7. Fill additional details if required
    const pathwaySelect = page.locator('select[name="pathway"]');
    if (await pathwaySelect.isVisible()) {
      await pathwaySelect.selectOption({ index: 1 }); // Select first pathway
    }
    
    // 8. Confirm booking
    await page.click('button[data-testid="confirm-booking"]');
    
    // 9. Wait for Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
    
    // 10. Fill Stripe payment form
    const stripeFrame = page.frameLocator('iframe[title*="Secure payment"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill(TEST_CONFIG.stripeTestCard.number);
    await stripeFrame.locator('input[name="exp-date"]').fill(TEST_CONFIG.stripeTestCard.expiry);
    await stripeFrame.locator('input[name="cvc"]').fill(TEST_CONFIG.stripeTestCard.cvc);
    
    // 11. Complete payment
    await page.click('button[type="submit"]');
    
    // 12. Wait for redirect back to confirmation
    await page.waitForURL(/\/booking\/confirmation/, { timeout: 30000 });
    
    // 13. Verify paid booking confirmation
    await expect(page.locator('h1')).toContainText('Booking Confirmed');
    await expect(page.locator('[data-testid="payment-status"]')).toContainText('PAID');
    
    logger.info('Authenticated paid session booking completed successfully');
  });
  
  test('Booking cancellation flow', async ({ page }) => {
    // First create a booking (simplified for this test)
    const bookingId = uuidv4();
    
    // Navigate to booking management page
    await page.goto(`/dashboard/bookings/${bookingId}`);
    
    // Click cancel button
    await page.click('button[data-testid="cancel-booking"]');
    
    // Confirm cancellation
    await page.click('button[data-testid="confirm-cancel"]');
    
    // Verify cancellation
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('CANCELLED');
    
    logger.info('Booking cancellation completed successfully');
  });
  
  test('Webhook processing verification', async ({ page, request }) => {
    // Create a test booking first
    const bookingResponse = await request.post('/api/scheduling/bookings/create', {
      data: {
        builderId: TEST_CONFIG.testBuilder.id,
        sessionTypeId: 'test-session-type-id',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        clientEmail: 'webhook-test@example.com',
        clientName: 'Webhook Test User'
      }
    });
    
    const { bookingId } = await bookingResponse.json();
    
    // Simulate Calendly webhook
    const calendlyWebhookResponse = await request.post('/api/webhooks/calendly', {
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature' // Would be real in production
      },
      data: {
        event: 'invitee.created',
        payload: {
          event: {
            uuid: `evt_${Date.now()}`,
            uri: `https://calendly.com/events/${bookingId}`,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          },
          invitee: {
            uuid: `inv_${Date.now()}`,
            email: 'webhook-test@example.com',
            name: 'Webhook Test User'
          },
          tracking: {
            utm_content: bookingId
          }
        }
      }
    });
    
    expect(calendlyWebhookResponse.status()).toBe(200);
    
    // Verify booking was updated
    const updatedBooking = await request.get(`/api/scheduling/bookings/${bookingId}`);
    const bookingData = await updatedBooking.json();
    
    expect(bookingData.calendlyEventId).toBeTruthy();
    expect(bookingData.status).toBe('CONFIRMED');
    
    logger.info('Webhook processing verified successfully');
  });
  
  test('Email notification verification', async ({ page, request }) => {
    // This test would check if emails were sent
    // In a real environment, you might use a service like Mailhog or check SendGrid API
    
    // For now, we'll check if the email function was called
    const emailLogResponse = await request.get('/api/test/email-logs');
    const emailLogs = await emailLogResponse.json();
    
    // Verify confirmation email was sent
    const confirmationEmail = emailLogs.find(log => 
      log.type === 'booking_confirmation'
    );
    
    expect(confirmationEmail).toBeTruthy();
    expect(confirmationEmail.to).toContain('@example.com');
    
    logger.info('Email notifications verified successfully');
  });
});

// Helper function to wait for element
async function waitForElement(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout });
  return page.locator(selector);
}

// Helper function to fill Stripe test card
async function fillStripeTestCard(page, cardDetails) {
  const stripeFrame = page.frameLocator('iframe[title*="Secure payment"]');
  await stripeFrame.locator('input[name="cardnumber"]').fill(cardDetails.number);
  await stripeFrame.locator('input[name="exp-date"]').fill(cardDetails.expiry);
  await stripeFrame.locator('input[name="cvc"]').fill(cardDetails.cvc);
}

// Cleanup function for test data
async function cleanupTestData(request, bookingId) {
  try {
    await request.delete(`/api/test/bookings/${bookingId}`);
  } catch (error) {
    logger.error('Error cleaning up test data', { error, bookingId });
  }
}