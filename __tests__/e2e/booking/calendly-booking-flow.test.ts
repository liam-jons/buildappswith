/**
 * E2E test for the Calendly booking flow
 */
import { test, expect } from '@playwright/test';
import { mockCalendlyEventTypes, mappedCalendlyEventTypes } from '../../mocks/scheduling/mock-calendly-data';
import { loginAsUser } from '../../utils/e2e/auth-utils';
import { waitForNetworkIdle } from '../../utils/e2e/async-utils';

// Create a test specifically for the Calendly booking flow
test('should complete Calendly booking flow and payment process', async ({ page }) => {
  // Mock the Calendly API on the client side
  // This will run before navigating to avoid any race conditions
  await page.addInitScript(() => {
    // Mock window.Calendly object
    window.Calendly = {
      initInlineWidget: (options) => {
        // Create a fake Calendly widget UI
        const container = options.parentElement;
        container.innerHTML = `
          <div class="mock-calendly-ui">
            <h2>Mock Calendly Scheduler</h2>
            <div class="calendly-loading" style="display: none;">Loading...</div>
            <div class="calendly-times">
              <h3>Available Times</h3>
              <div class="time-slot" data-testid="time-slot-option">
                <button>Tomorrow at 10:00 AM</button>
              </div>
              <div class="time-slot">
                <button>Tomorrow at 2:00 PM</button>
              </div>
            </div>
            <button class="confirm-button" data-testid="confirm-booking-button">
              Confirm Booking
            </button>
          </div>
        `;
        
        // Add event listener for confirmation button
        const confirmButton = container.querySelector('.confirm-booking-button');
        if (confirmButton) {
          confirmButton.addEventListener('click', () => {
            // Simulate Calendly completion event
            window.parent.postMessage({
              event: 'calendly:event_scheduled',
              data: {
                event_type: { name: 'Initial Consultation' },
                invitee: { name: 'Test Client', email: 'test@example.com' },
                event: {
                  start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
                }
              }
            }, '*');
            
            // Redirect to the return URL specified in the options
            const returnUrl = new URL(options.url).searchParams.get('return_url');
            if (returnUrl) {
              window.location.href = returnUrl;
            }
          });
        }
      }
    };
    
    // Store the original fetch
    const originalFetch = window.fetch;
    
    // Mock fetch for Calendly API calls
    window.fetch = async (input, init) => {
      const url = input.toString();
      
      // Mock event types API
      if (url.includes('/api/scheduling/calendly/event-types')) {
        return new Response(JSON.stringify({
          eventTypes: mappedCalendlyEventTypes
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Mock scheduling link API
      if (url.includes('/api/scheduling/calendly/scheduling-link')) {
        return new Response(JSON.stringify({
          bookingUrl: 'https://calendly.com/test-builder/initial-consultation?utm_source=buildappswith',
          eventTypeId: 'test-event-type',
          sessionTypeId: 'session-1'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Pass through other requests
      return originalFetch(input, init);
    };
  });
  
  // Mock the Stripe checkout for payment
  await page.route('**/api/stripe/create-checkout-session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'mock-stripe-session-id',
        url: '/booking/confirmation?session_id=mock-stripe-session-id&status=success'
      })
    });
  });
  
  // Mock session status check
  await page.route('**/api/stripe/checkout-session-status*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          status: 'complete',
          paymentStatus: 'paid',
          bookingId: 'booking-123',
          calendlyEventId: 'evt-123'
        }
      })
    });
  });
  
  // Login as a test client
  await loginAsUser(page, 'client');
  
  // Navigate to a builder profile
  await page.goto('/profile/builder-1');
  await expect(page).toHaveTitle(/Builder Profile/);
  
  // Wait for page to load completely
  await waitForNetworkIdle(page);
  
  // Find and click on a session type
  const sessionTypeCard = page.locator('text=Initial Consultation');
  await expect(sessionTypeCard).toBeVisible();
  await sessionTypeCard.click();
  
  // Find and click the Book Session button
  const bookButton = page.getByRole('button', { name: /Book/i });
  await expect(bookButton).toBeVisible();
  await bookButton.click();
  
  // Should navigate to booking page with Calendly embed
  await expect(page).toHaveURL(/\/book\//);
  
  // Wait for the mock Calendly widget to load
  await expect(page.locator('.mock-calendly-ui')).toBeVisible();
  
  // Select a time slot
  const timeSlot = page.getByTestId('time-slot-option');
  await expect(timeSlot).toBeVisible();
  await timeSlot.click();
  
  // Click confirm booking
  const confirmButton = page.getByTestId('confirm-booking-button');
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  
  // Should redirect to the booking confirmation page
  await expect(page).toHaveURL(/\/booking\/confirmation/);
  
  // Check that booking details are displayed
  await expect(page.getByText(/Booking Confirmation/i)).toBeVisible();
  await expect(page.getByText(/Initial Consultation/i)).toBeVisible();
  
  // Click proceed to payment
  const paymentButton = page.getByRole('button', { name: /Proceed to Payment/i });
  await expect(paymentButton).toBeVisible();
  await paymentButton.click();
  
  // Should redirect to the payment confirmation page
  await expect(page).toHaveURL(/\/booking\/confirmation\?session_id=mock-stripe-session-id/);
  
  // Check that payment confirmation is displayed
  await expect(page.getByText(/Your booking has been confirmed/i)).toBeVisible();
  
  // Check for add to calendar button
  await expect(page.getByText(/Add to Calendar/i)).toBeVisible();
});

// Test error handling in the booking flow
test('should handle errors gracefully in the booking flow', async ({ page }) => {
  // Mock API errors
  await page.route('**/api/scheduling/calendly/event-types', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Failed to load session types'
      })
    });
  });
  
  // Login as a test client
  await loginAsUser(page, 'client');
  
  // Navigate to a builder profile
  await page.goto('/profile/builder-1');
  
  // Check that error message is displayed
  await expect(page.getByText(/Error loading session types/i)).toBeVisible();
  await expect(page.getByText(/Unable to load session types from Calendly/i)).toBeVisible();
  
  // Check for retry button
  const retryButton = page.getByRole('button', { name: /Try Again/i });
  await expect(retryButton).toBeVisible();
});