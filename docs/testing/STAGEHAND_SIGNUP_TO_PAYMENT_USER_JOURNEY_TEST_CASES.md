  Signup-to-Payment User Journey Test Cases

  1. Base Test Case Class

  // journeys/base-journey.test.ts
  import { test as base } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';
  import { BasePage } from '../page-objects/base.page';
  import { ClerkAuthManager } from '../framework/auth';
  import { ProductionTestDataManager } from '../framework/production-test-data';
  import { CalendlyTester } from '../framework/calendly-tester';
  import { StripePaymentTester } from '../framework/stripe-payment-tester';
  import { VisualVerifier } from '../framework/visual-verifier';

  // Create a fixture for all journey tests
  export const test = base.extend({
    stagehand: async ({ page }, use) => {
      // Initialize Stagehand
      const stagehand = await Stagehand.create(page);
      await use(stagehand);
    },

    basePage: async ({ page, stagehand }, use) => {
      // Create base page object
      await use(new BasePage(page, stagehand));
    },

    authManager: async ({ page, stagehand }, use) => {
      // Create auth manager
      await use(new ClerkAuthManager(page, stagehand));
    },

    dataManager: async ({ baseURL }, use) => {
      // Create test data manager
      const dataManager = new ProductionTestDataManager(baseURL || 'http://localhost:3000');

      // Initialize test environment
      await dataManager.initialize();

      await use(dataManager);

      // Clean up after test
      await dataManager.cleanup();
    },

    calendlyTester: async ({ page, stagehand }, use) => {
      // Create Calendly tester
      await use(new CalendlyTester(page, stagehand));
    },

    paymentTester: async ({ page, stagehand }, use) => {
      // Create payment tester
      await use(new StripePaymentTester(page, stagehand));
    },

    visualVerifier: async ({ stagehand }, use) => {
      // Create visual verifier
      await use(new VisualVerifier(stagehand));
    }
  });

  export { expect } from '@playwright/test';

  2. Complete New Client Journey

  // journeys/new-client-journey.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';

  test.describe('New client signup to payment journey', () => {
    test('new client can sign up, find a builder, book a session, and pay', async ({
      page,
      stagehand,
      basePage,
      dataManager,
      calendlyTester,
      paymentTester,
      visualVerifier
    }) => {
      // Create test builder with session types
      const builder = await dataManager.createTestBuilder({
        name: 'Journey Test Builder',
        expertise: ['React', 'Node.js', 'TypeScript'],
        hourlyRate: 85
      });

      await dataManager.createSessionTypes(builder.id, [
        {
          name: 'Initial Consultation',
          duration: 60,
          price: 75,
          calendlyUrl: 'https://calendly.com/test/60min'
        }
      ]);

      // 1. Navigate to signup page
      await page.goto('/signup');

      // 2. Create unique credentials for this test run
      const testEmail = `test-client-${Date.now()}@example.com`;
      const testPassword = 'SecurePass123!';

      // 3. Complete signup process
      await test.step('Complete signup form', async () => {
        await stagehand.act(`Enter "${testEmail}" in the email field`);
        await stagehand.act(`Click the continue or sign up button`);
        await stagehand.act(`Enter "${testPassword}" in the password field`);
        await stagehand.act(`Enter "${testPassword}" in the password confirmation field if present`);
        await stagehand.act(`Click the sign up or create account button`);
      });

      // 4. Complete onboarding if needed
      await test.step('Complete onboarding if required', async () => {
        // Check if there's an onboarding step
        const needsOnboarding = await stagehand.extract(`
          Is this an onboarding or profile setup page?
          Look for profile setup forms, role selection, or welcome messages.
          Answer with just "yes" or "no".
        `);

        if (needsOnboarding.text.toLowerCase().includes('yes')) {
          await stagehand.act(`Enter "Test Journey Client" in the name field`);
          await stagehand.act(`Select "Client" as the user role if there's a role selection`);
          await stagehand.act(`Click the complete profile, continue, or finish button`);
        }
      });

      // 5. Verify user is logged in and redirected appropriately
      await test.step('Verify successful authentication', async () => {
        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');

        // Verify user is authenticated
        const isAuthenticated = await stagehand.extract(`
          Is there clear evidence that the user is authenticated?
          Look for profile information, personalized content, or dashboard elements.
          Answer with just "yes" or "no" and why.
        `);

        expect(isAuthenticated.text.toLowerCase()).toContain('yes');
      });

      // 6. Navigate to marketplace
      await test.step('Navigate to marketplace', async () => {
        await page.goto('/marketplace');

        // Verify marketplace page loaded
        const marketplaceLoaded = await visualVerifier.verifyComponentLayout(
          'marketplace page with builder listings'
        );

        expect(marketplaceLoaded).toBe(true);
      });

      // 7. Find and select created test builder
      await test.step('Find and select builder', async () => {
        // Look for the test builder we created
        await stagehand.act(`
          Find the builder card for "${builder.name}" and click on it.
          If you don't see it immediately, try using search or scrolling.
        `);

        // Verify navigation to builder profile
        await page.waitForURL(/.*\/marketplace\/builders\/.*/);

        // Verify profile page loaded correctly
        const profileLoaded = await visualVerifier.verifyComponentLayout(
          'builder profile page with details and session types'
        );

        expect(profileLoaded).toBe(true);

        // Verify correct builder loaded
        const builderNameVisible = await stagehand.extract(`
          Is the name "${builder.name}" visible on this page?
          Answer with just "yes" or "no".
        `);

        expect(builderNameVisible.text.toLowerCase()).toContain('yes');
      });

      // 8. Select a session type
      await test.step('Select session type', async () => {
        await stagehand.act(`
          Find and click on the session type card or button for "Initial Consultation"
        `);

        // Verify session selection
        const sessionSelected = await stagehand.extract(`
          Has a session type been selected?
          Look for visual confirmation, highlighting, or proceed buttons becoming enabled.
          Answer with just "yes" or "no" and why.
        `);

        expect(sessionSelected.text.toLowerCase()).toContain('yes');
      });

      // 9. Interact with Calendly scheduling
      await test.step('Complete Calendly scheduling', async () => {
        // Wait for Calendly to load
        await page.waitForSelector('iframe[src*="calendly.com"]', { timeout: 15000 });

        // Select time slot using Calendly tester
        await calendlyTester.selectTimeSlot();

        // Fill booking details
        await calendlyTester.fillBookingDetails({
          name: 'Test Journey Client',
          email: testEmail,
          notes: 'This is an automated test booking'
        });

        // Verify booking confirmation page loaded
        await page.waitForURL(/.*\/booking\/confirmation\/.*/);

        const confirmationLoaded = await visualVerifier.verifyComponentLayout(
          'booking confirmation page with booking details'
        );

        expect(confirmationLoaded).toBe(true);
      });

      // 10. Proceed to payment
      await test.step('Proceed to payment', async () => {
        // Look for and click payment button
        await stagehand.act(`
          Find and click the button to proceed to payment or checkout
        `);

        // Verify redirect to payment/checkout page
        await page.waitForURL(/.*\/payment\/checkout\/.*/);

        // Verify payment page loaded
        const paymentPageLoaded = await visualVerifier.verifyComponentLayout(
          'payment checkout page with price information'
        );

        expect(paymentPageLoaded).toBe(true);
      });

      // 11. Complete Stripe payment
      await test.step('Complete payment', async () => {
        // Use the payment tester to complete payment with test card
        await paymentTester.completeStripePayment();

        // Verify redirect to success page
        await page.waitForURL(/.*\/payment\/success\/.*/);

        // Verify success page shows correct information
        const paymentSuccessful = await visualVerifier.verifyComponentLayout(
          'payment success page with booking confirmation'
        );

        expect(paymentSuccessful).toBe(true);
      });

      // 12. Extract booking reference for verification
      await test.step('Verify booking reference', async () => {
        const bookingReference = await stagehand.extract(`
          Find and extract the booking reference number or confirmation code.
          Return just the reference code itself.
        `);

        // Verify we got a booking reference
        expect(bookingReference.text.trim()).toBeTruthy();

        // Log reference for debugging
        console.log(`Successfully completed booking with reference: ${bookingReference.text.trim()}`);
      });
    });
  });

  3. Returning Client Journey

  // journeys/returning-client-journey.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';

  test.describe('Returning client booking journey', () => {
    test('returning client can log in, book a session, and pay', async ({
      page,
      stagehand,
      basePage,
      authManager,
      dataManager,
      calendlyTester,
      paymentTester,
      visualVerifier
    }) => {
      // Create test client
      const client = await dataManager.createTestClient({
        name: 'Returning Test Client',
        email: `returning-${Date.now()}@example.com`
      });

      // Create test builder with session types
      const builder = await dataManager.createTestBuilder();
      await dataManager.createSessionTypes(builder.id);

      // 1. Authenticate directly using test endpoint
      await test.step('Authenticate as test client', async () => {
        await authManager.authenticateViaTestApi('CLIENT_BASIC');

        // Verify authentication
        const isAuthenticated = await stagehand.extract(`
          Is there clear evidence that the user is authenticated?
          Answer with just "yes" or "no" and why.
        `);

        expect(isAuthenticated.text.toLowerCase()).toContain('yes');
      });

      // 2. Navigate directly to builder profile
      await test.step('Navigate to builder profile', async () => {
        await page.goto(`/marketplace/builders/${builder.id}`);

        // Verify profile page loaded
        const profileLoaded = await visualVerifier.verifyComponentLayout(
          'builder profile with session types'
        );

        expect(profileLoaded).toBe(true);
      });

      // 3. Select session and complete Calendly booking
      await test.step('Book a session', async () => {
        // Select session type
        await stagehand.act(`
          Find and click on the first available session type
        `);

        // Complete Calendly booking
        await calendlyTester.selectTimeSlot();
        await calendlyTester.fillBookingDetails({
          name: client.name,
          email: client.email
        });

        // Verify booking confirmation
        await page.waitForURL(/.*\/booking\/confirmation\/.*/);

        const confirmationLoaded = await visualVerifier.verifyComponentLayout(
          'booking confirmation page'
        );

        expect(confirmationLoaded).toBe(true);
      });

      // 4. Complete payment
      await test.step('Complete payment', async () => {
        // Proceed to payment
        await stagehand.act(`
          Find and click the button to proceed to payment
        `);

        // Complete payment with test card
        await paymentTester.completeStripePayment();

        // Verify success
        await page.waitForURL(/.*\/payment\/success\/.*/);

        const paymentSuccessful = await visualVerifier.verifyComponentLayout(
          'payment success page'
        );

        expect(paymentSuccessful).toBe(true);
      });
    });
  });

  4. Error Recovery Test Cases

  // journeys/error-recovery-journey.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';

  test.describe('Error recovery during booking flows', () => {
    test('can recover from Calendly iframe loading failure', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      calendlyTester
    }) => {
      // Setup test data
      const builder = await dataManager.createTestBuilder();
      await dataManager.createSessionTypes(builder.id);

      // Authenticate as test client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Navigate to builder profile
      await page.goto(`/marketplace/builders/${builder.id}`);

      // Select session type
      await stagehand.act(`
        Find and click on the first available session type
      `);

      // Simulate Calendly iframe failure by blocking the domain
      await page.route('**/*.calendly.com/**', route => route.abort());

      // Verify Calendly iframe error state
      const errorState = await stagehand.extract(`
        Is there an error message or loading failure indicator for the calendar?
        Answer with just "yes" or "no" and describe what you see.
      `);

      expect(errorState.text.toLowerCase()).toContain('yes');

      // Attempt recovery by refreshing
      await stagehand.act(`
        Find and click any retry, refresh, or reload button on the page
      `);

      // Unblock Calendly routes
      await page.unroute('**/*.calendly.com/**');

      // Verify recovery
      const recovered = await stagehand.extract(`
        Has the calendar or scheduling interface loaded successfully now?
        Answer with just "yes" or "no" and describe what you see.
      `);

      expect(recovered.text.toLowerCase()).toContain('yes');
    });

    test('can recover from payment failure', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      calendlyTester,
      paymentTester
    }) => {
      // Setup test data
      const builder = await dataManager.createTestBuilder();
      await dataManager.createSessionTypes(builder.id);

      // Authenticate as test client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Navigate to builder profile and book session
      await page.goto(`/marketplace/builders/${builder.id}`);
      await stagehand.act(`Find and click on the first available session type`);
      await calendlyTester.selectTimeSlot();
      await calendlyTester.fillBookingDetails({
        name: 'Error Test Client',
        email: 'error-test@example.com'
      });

      // Proceed to payment
      await stagehand.act(`Find and click the button to proceed to payment`);

      // Attempt payment with failing card
      await paymentTester.completeStripePayment('4000000000000002'); // Declined card

      // Verify error state
      const errorState = await stagehand.extract(`
        Is there an error message indicating payment failure?
        Answer with just "yes" or "no" and describe what you see.
      `);

      expect(errorState.text.toLowerCase()).toContain('yes');

      // Retry with valid card
      await paymentTester.completeStripePayment(); // Default successful test card

      // Verify success
      await page.waitForURL(/.*\/payment\/success\/.*/);

      const successState = await stagehand.extract(`
        Is there a success message confirming the payment and booking?
        Answer with just "yes" or "no" and describe what you see.
      `);

      expect(successState.text.toLowerCase()).toContain('yes');
    });
  });