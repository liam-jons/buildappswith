/**
 * Calendly Booking User Journey Test
 * 
 * Tests the complete booking flow with Calendly integration:
 * - Finding a builder
 * - Selecting a session type
 * - Booking through Calendly
 * - Handling webhooks
 * - Payment processing
 * - Booking confirmation
 */
import { test, expect } from '@playwright/test';
import { 
  BuilderProfilePage,
  BookingPage,
  CalendlyBookingPage,
  PaymentPage,
  BookingConfirmationPage,
  AuthPage
} from '../page-objects';
import { withE2EIsolation, createE2EDataFactory } from '../utils/database-isolation';
import { createTestBuilders, loginAsTestUser } from '../utils/test-data-helpers';
import { CalendlyWebhookSimulator, StripeWebhookSimulator } from '../utils/webhook-simulators';
import { TestPersona } from '../../utils/models';

// Test configuration
const USE_MOCK_CALENDLY = true; // Control whether to mock Calendly or not

test.describe('Calendly Booking User Journey', () => {
  test('complete booking flow with Calendly and Stripe payment', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Set up test data
      const factory = createE2EDataFactory(db);
      const builders = await createTestBuilders(factory);
      const frontendBuilder = builders.frontend;
      
      // Init webhook simulators
      const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
      const calendlyWebhook = new CalendlyWebhookSimulator(baseUrl);
      const stripeWebhook = new StripeWebhookSimulator(baseUrl);
      
      // Initialize page objects
      const authPage = new AuthPage(page);
      const builderProfilePage = new BuilderProfilePage(page);
      const calendlyBookingPage = new CalendlyBookingPage(page);
      const paymentPage = new PaymentPage(page);
      const bookingConfirmationPage = new BookingConfirmationPage(page);
      
      // Part 1: Login as a client
      await test.step('Authenticate as client', async () => {
        await loginAsTestUser(page, TestPersona.CLIENT_BASIC);
        expect(await authPage.isLoggedIn()).toBeTruthy();
      });
      
      // Part 2: Navigate to builder profile
      await test.step('Navigate to builder profile', async () => {
        // Go directly to the builder's profile
        await builderProfilePage.navigateToBuilder(frontendBuilder.user.id);
        
        // Verify builder profile loaded
        const builderName = await builderProfilePage.getBuilderName();
        expect(builderName).toContain('Frontend');
        
        // Verify session types are displayed
        const sessionTypeCount = await builderProfilePage.getSessionTypeCount();
        expect(sessionTypeCount).toBeGreaterThan(0);
      });
      
      // Part 3: Select session type and start booking
      await test.step('Select session type and start booking', async () => {
        // Select the first session type (consultation)
        await builderProfilePage.selectSessionTypeByName('Frontend Consultation');
        
        // Click book session button
        await builderProfilePage.clickBookSession();
        
        // Should navigate to booking page
        await expect(page).toHaveURL(/.*\/book\//);
      });
      
      // Part 4: Mock Calendly booking flow
      await test.step('Complete Calendly booking', async () => {
        if (USE_MOCK_CALENDLY) {
          // Wait for Calendly embed to load
          await calendlyBookingPage.waitForCalendlyEmbed();
          
          // Select a time slot
          await calendlyBookingPage.selectTimeSlot(0);
          
          // Confirm booking
          await calendlyBookingPage.confirmBooking();
          
          // Should navigate to confirmation page
          await expect(page).toHaveURL(/.*\/booking\/confirmation/);
          
          // Extract booking ID
          const bookingId = calendlyBookingPage.getBookingId();
          expect(bookingId).toBeTruthy();
          
          // Simulate Calendly webhook for invitee.created event
          await calendlyWebhook.sendEvent('invitee.created', {
            event: {
              uuid: 'test-event-uuid'
            },
            tracking: {
              utm_content: bookingId as string
            }
          });
        } else {
          // Skip this part in actual testing since we can't interact with real Calendly
          console.log('Skipping Calendly interaction - would happen on real site');
        }
      });
      
      // Part 5: Continue to payment
      await test.step('Process payment', async () => {
        // Verify booking confirmation page
        const isBookingConfirmed = await bookingConfirmationPage.isBookingConfirmed();
        expect(isBookingConfirmed).toBeTruthy();
        
        // Get current URL to extract booking ID if needed
        const bookingUrl = page.url();
        const bookingIdMatch = bookingUrl.match(/bookingId=([^&]+)/);
        const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
        expect(bookingId).toBeTruthy();
        
        // Click proceed to payment button
        await page.click('[data-testid="proceed-to-payment"]');
        
        // Should navigate to payment page
        await expect(page).toHaveURL(/.*\/payment/);
        
        // Fill payment details
        await paymentPage.fillPaymentDetails({
          cardNumber: '4242424242424242', // Test card
          expiry: '12/30',
          cvc: '123',
          name: 'Test User'
        });
        
        // Confirm payment
        await paymentPage.confirmPayment();
        
        // Should navigate to success page
        await expect(page).toHaveURL(/.*\/(booking\/confirmation|payment\/success)/);
        
        // Simulate Stripe webhook for payment completion
        const stripeResponse = await stripeWebhook.sendEvent('checkout.session.completed', {
          bookingId: bookingId
        });
        
        // Webhook should return success
        expect(stripeResponse.status).toBe(200);
      });
      
      // Part 6: Verify booking confirmation
      await test.step('Verify booking confirmation', async () => {
        // Reload page to see updated booking status
        await page.reload();
        
        // Check booking confirmation
        const bookingDetails = await bookingConfirmationPage.getBookingDetails();
        
        // Verify payment status
        expect(bookingDetails.paymentStatus?.toLowerCase()).toContain('paid');
        
        // Verify booking status
        expect(bookingDetails.status?.toLowerCase()).toContain('confirmed');
        
        // Verify add to calendar button is visible
        const addToCalendarVisible = await page.isVisible('[data-testid="add-to-calendar"]');
        expect(addToCalendarVisible).toBeTruthy();
      });
    });
  });
  
  test('booking flow handles Calendly cancellation', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Set up test data
      const factory = createE2EDataFactory(db);
      
      // Create booking scenario
      const scenario = await factory.createBookingScenario({
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      });
      
      // Initialize webhook simulator
      const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
      const calendlyWebhook = new CalendlyWebhookSimulator(baseUrl);
      
      // Login as client
      await loginAsTestUser(page, TestPersona.CLIENT_BASIC);
      
      // Go to booking confirmation page
      await page.goto(`/booking/confirmation?bookingId=${scenario.booking.id}`);
      
      // Verify booking is confirmed
      const bookingConfirmationPage = new BookingConfirmationPage(page);
      const initialDetails = await bookingConfirmationPage.getBookingDetails();
      expect(initialDetails.status?.toLowerCase()).toContain('confirmed');
      
      // Simulate Calendly cancellation webhook
      await calendlyWebhook.sendEvent('invitee.canceled', {
        event: { 
          uuid: scenario.booking.calendlyEventUri?.split('/').pop() || 'test-event-uuid'
        },
        tracking: {
          utm_content: scenario.booking.id
        }
      });
      
      // Reload page to see updated status
      await page.reload();
      
      // Verify booking is now cancelled
      const updatedDetails = await bookingConfirmationPage.getBookingDetails();
      expect(updatedDetails.status?.toLowerCase()).toContain('cancel');
    });
  });
  
  test('booking recovery flow handles payment failure', async ({ page }) => {
    await withE2EIsolation(async (db) => {
      // Set up test data
      const factory = createE2EDataFactory(db);
      
      // Create booking scenario with pending payment
      const scenario = await factory.createBookingScenario({
        status: 'PENDING',
        paymentStatus: 'PENDING'
      });
      
      // Initialize webhook simulator
      const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
      const stripeWebhook = new StripeWebhookSimulator(baseUrl);
      
      // Login as client
      await loginAsTestUser(page, TestPersona.CLIENT_BASIC);
      
      // Go to booking recovery page
      await page.goto(`/booking/recovery?bookingId=${scenario.booking.id}`);
      
      // Initialize payment page
      const paymentPage = new PaymentPage(page);
      
      // Fill payment details (for a failing card)
      await paymentPage.fillPaymentDetails({
        cardNumber: '4000000000000002', // Test card that fails
        expiry: '12/30',
        cvc: '123',
        name: 'Test User'
      });
      
      // Try to submit payment (should fail)
      await paymentPage.confirmPayment();
      
      // Verify error message is displayed
      const errorMessage = await paymentPage.getPaymentError();
      expect(errorMessage).toBeTruthy();
      
      // Simulate Stripe webhook for payment failure
      await stripeWebhook.sendEvent('payment_intent.payment_failed', {
        bookingId: scenario.booking.id
      });
      
      // Verify we can retry payment
      const retryButtonVisible = await page.isVisible('[data-testid="retry-payment"]');
      expect(retryButtonVisible).toBeTruthy();
    });
  });
});