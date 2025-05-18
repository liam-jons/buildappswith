
  Stagehand E2E Test Architecture

  Project Structure

  stagehand-tests/
  ├── config/
  │   ├── stagehand.config.ts        # Main configuration
  │   └── environment.ts             # Environment-specific settings
  ├── page-objects/
  │   ├── base.page.ts               # Base page with Stagehand extensions
  │   ├── auth/
  │   │   ├── signup.page.ts         # Signup flow
  │   │   └── login.page.ts          # Login flow
  │   ├── marketplace/
  │   │   ├── browse.page.ts         # Builder browsing
  │   │   └── builder-profile.page.ts# Builder profile
  │   ├── booking/
  │   │   ├── session-type.page.ts   # Session selection
  │   │   ├── calendly.page.ts       # Calendly integration
  │   │   └── confirmation.page.ts   # Booking confirmation
  │   └── payment/
  │       └── checkout.page.ts       # Stripe checkout
  ├── framework/
  │   ├── auth.ts                    # Authentication utilities
  │   ├── data-factory.ts            # Test data generation
  │   ├── visual-verifier.ts         # AI visual verification
  │   └── webhook-simulator.ts       # Webhook testing
  ├── journeys/
  │   ├── signup-to-booking.test.ts  # Complete signup to booking
  │   ├── auth-flows.test.ts         # Authentication journeys
  │   ├── marketplace-browse.test.ts # Marketplace journeys
  │   └── payment-flows.test.ts      # Payment processing journeys
  └── utils/
      ├── selectors.ts               # AI-friendly element descriptions
      ├── retry.ts                   # Resilient action utilities
      └── assertions.ts              # Stagehand-specific assertions

  Key Components

  1. Stagehand-Enhanced Page Objects

  // Base Stagehand Page with resilient actions
  export class BasePage {
    constructor(protected page: Page, protected stagehand: Stagehand) {}

    // AI-powered element finding with context
    async findElement(description: string, context?: string): Promise<Locator> {
      const contextPrompt = context ? `Context: ${context}` : '';
      const results = await this.stagehand.observe(`
        Find the element that ${description}.
        ${contextPrompt}
        Return the most specific selector.
      `);

      if (!results.length) {
        throw new Error(`Could not find element: ${description}`);
      }

      return this.page.locator(results[0].selector);
    }

    // Resilient action with fallbacks
    async performAction(instruction: string, fallbacks: string[] = []): Promise<void> {
      try {
        await this.stagehand.act(instruction);
      } catch (error) {
        console.log(`Action failed: ${error.message}`);

        for (const fallback of fallbacks) {
          try {
            await this.stagehand.act(fallback);
            return;
          } catch (fallbackError) {
            console.log(`Fallback failed: ${fallbackError.message}`);
          }
        }

        throw new Error(`All attempts failed for: ${instruction}`);
      }
    }

    // Visual verification
    async verifyVisual(description: string): Promise<boolean> {
      const result = await this.stagehand.extract(`
        Examine the page and tell me if ${description}.
        Respond only with "yes" or "no" and a brief explanation.
      `);

      return result.text.toLowerCase().includes('yes');
    }
  }

  2. Authentication Manager for Clerk

  export class ClerkAuthManager {
    constructor(private page: Page, private stagehand: Stagehand) {}

    // Direct API-based auth for testing
    async authenticateViaTestApi(role: UserRole): Promise<void> {
      await this.page.goto(`/auth-test?role=${role}`);
      await this.page.waitForSelector('[data-testid="auth-success"]', { timeout: 10000 });

      // Verify auth success via AI
      const isAuthenticated = await this.stagehand.extract(`
        Is there clear visual indication that the user is successfully authenticated?
        Look for success messages, user profile elements, or role indicators.
        Respond with just "yes" or "no" and a brief reason.
      `);

      if (!isAuthenticated.text.toLowerCase().includes('yes')) {
        throw new Error(`Authentication failed for role: ${role}`);
      }
    }

    // UI-based authentication for testing real flows
    async authenticateViaUI(email: string, password: string): Promise<void> {
      await this.page.goto('/login');

      // Use Stagehand to interact with Clerk UI
      await this.stagehand.act(`Enter "${email}" into the email field`);
      await this.stagehand.act(`Click the continue or sign in button`);

      // Check if password field appears
      const passwordFieldVisible = await this.stagehand.extract(`
        Is there a password field visible on the page?
        Answer with just "yes" or "no".
      `);

      if (passwordFieldVisible.text.toLowerCase().includes('yes')) {
        await this.stagehand.act(`Enter "${password}" into the password field`);
        await this.stagehand.act(`Click the sign in button`);
      }

      // Wait for redirect or auth success
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });

      // Verify authentication success
      const authSuccess = await this.stagehand.extract(`
        Determine if the user is now authenticated on this page.
        Look for user-specific UI elements, profile info, or dashboard content.
        Answer with just "yes" or "no" and why.
      `);

      if (!authSuccess.text.toLowerCase().includes('yes')) {
        throw new Error('Authentication via UI failed');
      }
    }

    // Save auth state for reuse
    async saveAuthState(role: string): Promise<void> {
      const state = await this.page.context().storageState();
      await fs.promises.writeFile(`./auth-states/${role}.json`, JSON.stringify(state));
    }

    // Load saved auth state
    async loadAuthState(role: string): Promise<void> {
      const statePath = `./auth-states/${role}.json`;
      try {
        const state = JSON.parse(await fs.promises.readFile(statePath, 'utf-8'));
        await this.page.context().addCookies(state.cookies);

        // Apply localStorage
        await this.page.evaluate((storageState) => {
          for (const [key, value] of Object.entries(storageState.origins[0].localStorage)) {
            localStorage.setItem(key, value as string);
          }
        }, state);
      } catch (error) {
        throw new Error(`Failed to load auth state for ${role}: ${error.message}`);
      }
    }
  }

  3. Database Isolation and Test Data Management

  export class TestDataManager {
    private testId: string;

    constructor(private baseUrl: string) {
      this.testId = `stagehand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Initialize isolated test environment
    async initialize(): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: this.testId })
      });
    }

    // Create test builder profile
    async createTestBuilder(options: Partial<BuilderProfile> = {}): Promise<BuilderProfile> {
      const response = await fetch(`${this.baseUrl}/api/test/builders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: this.testId,
          ...options
        })
      });

      return await response.json();
    }

    // Create test session types
    async createSessionTypes(builderId: string, options: Partial<SessionTypeOptions>[] = []): Promise<SessionType[]> {
      const response = await fetch(`${this.baseUrl}/api/test/session-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: this.testId,
          builderId,
          sessionTypes: options
        })
      });

      return await response.json();
    }

    // Create full booking scenario with all dependencies
    async createBookingScenario(): Promise<BookingScenario> {
      const response = await fetch(`${this.baseUrl}/api/test/booking-scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: this.testId
        })
      });

      return await response.json();
    }

    // Clean up test data
    async cleanup(): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: this.testId })
      });
    }
  }

  4. Calendly Integration Testing

  export class CalendlyTester {
    constructor(private page: Page, private stagehand: Stagehand) {}

    // Interact with Calendly embed
    async selectTimeSlot(dateIndex: number = 0, timeIndex: number = 0): Promise<void> {
      // Wait for Calendly iframe to load
      await this.page.waitForSelector('iframe[src*="calendly.com"]');

      // Use Stagehand's AI to navigate Calendly UI
      await this.stagehand.act(`
        Click on a date in the calendar, preferably the ${dateIndex === 0 ? 'first' : 'next'} available date
      `);

      await this.stagehand.act(`
        Select a time slot, preferably the ${timeIndex === 0 ? 'first' : 'next'} available time
      `);

      // Verify selection was made
      const selectionMade = await this.stagehand.extract(`
        Is there visual confirmation that a time slot has been selected?
        Look for highlighted elements, confirmation text, or a "next" button becoming enabled.
        Answer with just "yes" or "no" and why.
      `);

      if (!selectionMade.text.toLowerCase().includes('yes')) {
        throw new Error('Failed to select a time slot in Calendly');
      }
    }

    // Complete Calendly booking form
    async fillBookingDetails(details: {
      name: string;
      email: string;
      notes?: string;
    }): Promise<void> {
      await this.stagehand.act(`Enter "${details.name}" in the name field`);
      await this.stagehand.act(`Enter "${details.email}" in the email field`);

      if (details.notes) {
        await this.stagehand.act(`Enter "${details.notes}" in the notes or details field`);
      }

      await this.stagehand.act(`Click the schedule or confirm button`);

      // Verify booking was confirmed
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });

      const bookingConfirmed = await this.stagehand.extract(`
        Is there clear indication that the booking was confirmed?
        Look for confirmation messages, reference numbers, or success screens.
        Answer with just "yes" or "no" and why.
      `);

      if (!bookingConfirmed.text.toLowerCase().includes('yes')) {
        throw new Error('Failed to confirm booking');
      }
    }

    // Simulate Calendly webhook events
    async simulateWebhookEvent(eventType: string, inviteeUri: string): Promise<void> {
      const payload = this.generateWebhookPayload(eventType, inviteeUri);

      await fetch(`/api/webhooks/calendly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Calendly-Webhook-Signature': 'test-signature' // In real tests, generate actual signature
        },
        body: JSON.stringify(payload)
      });
    }

    private generateWebhookPayload(eventType: string, inviteeUri: string): any {
      // Generate appropriate payload based on event type
      return {
        event: eventType,
        payload: {
          event_type: {
            uri: `https://api.calendly.com/event_types/ABCDE12345`,
            name: "Test Session Type"
          },
          event: {
            uri: `https://api.calendly.com/scheduled_events/FGHIJ67890`,
            created_at: new Date().toISOString(),
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
          },
          invitee: {
            uri: inviteeUri,
            email: "test@example.com",
            name: "Test User",
            timezone: "America/New_York"
          }
        }
      };
    }
  }


  5. Stripe Payment Testing

  export class StripePaymentTester {
    constructor(private page: Page, private stagehand: Stagehand) {}

    // Handle Stripe checkout
    async completeStripePayment(
      cardNumber: string = "4242424242424242",
      expDate: string = "1230",
      cvc: string = "123"
    ): Promise<void> {
      // Wait for Stripe iframe to load
      await this.page.waitForSelector('iframe[name^="__privateStripeFrame"]');

      // Get Stripe iframe and handle card input
      const stripeIframe = this.page.frameLocator('iframe[name^="__privateStripeFrame"]');

      // Fill card details using Stagehand AI assistance
      await this.stagehand.act(`Enter the credit card number "${cardNumber}" in the payment form`);
      await this.stagehand.act(`Enter the expiration date "${expDate}" in the payment form`);
      await this.stagehand.act(`Enter the CVC "${cvc}" in the payment form`);

      // Submit payment
      await this.stagehand.act(`Click the submit or pay button`);

      // Wait for payment processing
      await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

      // Verify payment success or failure based on expected outcome
      const isSuccessful = cardNumber === "4242424242424242";

      const paymentStatus = await this.stagehand.extract(`
        Determine if the payment was ${isSuccessful ? 'successful' : 'declined'}.
        Look for success messages, confirmation details, or error notifications.
        Answer with just "yes" or "no" and why.
      `);

      const statusConfirmed = paymentStatus.text.toLowerCase().includes('yes');

      if (!statusConfirmed) {
        throw new Error(`Expected payment to be ${isSuccessful ? 'successful' : 'declined'} but verification failed`);
      }
    }

    // Simulate Stripe webhook events
    async simulateStripeWebhook(eventType: string, paymentIntent: string): Promise<void> {
      const payload = this.generateWebhookPayload(eventType, paymentIntent);

      await fetch(`/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': `t=${Date.now()},v1=test-signature` // In real tests, generate actual signature
        },
        body: JSON.stringify(payload)
      });
    }

    private generateWebhookPayload(eventType: string, paymentIntent: string): any {
      // Generate appropriate payload based on event type
      const now = Math.floor(Date.now() / 1000);

      return {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: now,
        data: {
          object: {
            id: paymentIntent,
            object: 'payment_intent',
            amount: 10000,
            currency: 'usd',
            status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
            created: now - 60,
            metadata: {
              bookingId: `booking_${Date.now()}`,
              testId: `test_${Date.now()}`
            }
          }
        },
        type: eventType
      };
    }
  }

  6. AI-Powered Visual Verification for UI Components

  export class VisualVerifier {
    constructor(private stagehand: Stagehand) {}

    // Verify component layout and visual appearance
    async verifyComponentLayout(componentDescription: string): Promise<boolean> {
      const result = await this.stagehand.extract(`
        Examine the page and tell me if the ${componentDescription} appears correctly laid out.
        Consider spacing, alignment, responsiveness, and visual hierarchy.
        Answer with "yes" or "no" followed by a brief explanation.
      `);

      return result.text.toLowerCase().includes('yes');
    }

    // Verify specific UI element state
    async verifyElementState(elementDescription: string, expectedState: string): Promise<boolean> {
      const result = await this.stagehand.extract(`
        Find the ${elementDescription} and tell me if it is ${expectedState}.
        Answer with "yes" or "no" followed by a brief explanation.
      `);

      return result.text.toLowerCase().includes('yes');
    }

    // Verify responsive behavior
    async verifyResponsiveLayout(breakpoint: 'mobile' | 'tablet' | 'desktop'): Promise<boolean> {
      // Set viewport size based on breakpoint
      switch (breakpoint) {
        case 'mobile':
          await this.stagehand.page.setViewportSize({ width: 375, height: 667 });
          break;
        case 'tablet':
          await this.stagehand.page.setViewportSize({ width: 768, height: 1024 });
          break;
        case 'desktop':
          await this.stagehand.page.setViewportSize({ width: 1280, height: 800 });
          break;
      }

      // Allow layout to adjust
      await this.stagehand.page.waitForTimeout(500);

      const result = await this.stagehand.extract(`
        Analyze the page layout at ${breakpoint} size.
        Is the layout correctly responsive with appropriate spacing, text sizing, and component arrangement?
        Answer with "yes" or "no" followed by a brief explanation.
      `);

      return result.text.toLowerCase().includes('yes');
    }

    // Verify accessibility features
    async verifyAccessibilityFeatures(feature: string): Promise<boolean> {
      const result = await this.stagehand.extract(`
        Examine the page for ${feature} accessibility features.
        Look for appropriate contrast, focus indicators, semantic structure, and alternative text.
        Answer with "yes" or "no" followed by a brief explanation.
      `);

      return result.text.toLowerCase().includes('yes');
    }
  }

  7. Complete User Journey Test Implementation

  Here's an example of a complete user journey test using the components we've designed:

  import { test } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';
  import { BasePage } from '../page-objects/base.page';
  import { ClerkAuthManager } from '../framework/auth';
  import { TestDataManager } from '../framework/data-factory';
  import { CalendlyTester } from '../framework/calendly-tester';
  import { StripePaymentTester } from '../framework/stripe-payment-tester';
  import { VisualVerifier } from '../framework/visual-verifier';

  // Test the complete signup-to-payment flow
  test('new client can sign up, book a session, and complete payment', async ({ page }) => {
    // Initialize Stagehand
    const stagehand = await Stagehand.create(page);

    // Initialize test components
    const basePage = new BasePage(page, stagehand);
    const authManager = new ClerkAuthManager(page, stagehand);
    const dataManager = new TestDataManager('http://localhost:3000');
    const calendlyTester = new CalendlyTester(page, stagehand);
    const paymentTester = new StripePaymentTester(page, stagehand);
    const visualVerifier = new VisualVerifier(stagehand);

    // Initialize test environment with isolated data
    await dataManager.initialize();

    try {
      // Create test builder with session types
      const builder = await dataManager.createTestBuilder({
        name: 'Test Builder',
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

      // 1. Register as a new client
      await page.goto('/signup');

      // Create a unique email for this test run
      const testEmail = `test-client-${Date.now()}@example.com`;
      const testPassword = 'SecurePass123!';

      // Fill signup form using AI assistance
      await stagehand.act(`Enter "${testEmail}" in the email field`);
      await stagehand.act(`Click the continue or sign up button`);
      await stagehand.act(`Enter "${testPassword}" in the password field`);
      await stagehand.act(`Enter "${testPassword}" in the password confirmation field if present`);
      await stagehand.act(`Click the sign up or create account button`);

      // Complete profile setup if needed
      const needsProfileSetup = await stagehand.extract(`
        Does the page show a profile setup form or onboarding process?
        Answer with just "yes" or "no".
      `);

      if (needsProfileSetup.text.toLowerCase().includes('yes')) {
        await stagehand.act(`Enter "Test Client" in the name or full name field`);
        await stagehand.act(`Select "Client" as the user role if there's a role selection`);
        await stagehand.act(`Click the complete profile or continue button`);
      }

      // Wait for redirect to dashboard or home
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      // Verify successful signup and authentication
      const signupSuccess = await stagehand.extract(`
        Is there clear indication that the user has successfully signed up and is logged in?
        Look for dashboard access, welcome messages, or authenticated UI elements.
        Answer with just "yes" or "no" and why.
      `);

      if (!signupSuccess.text.toLowerCase().includes('yes')) {
        throw new Error('User signup failed');
      }

      // 2. Navigate to marketplace
      await page.goto('/marketplace');

      // Verify marketplace page loaded correctly
      const marketplaceLoaded = await visualVerifier.verifyComponentLayout('marketplace page with builder cards');
      if (!marketplaceLoaded) {
        throw new Error('Marketplace page did not load correctly');
      }

      // 3. Find and select builder
      await stagehand.act(`Find the builder card for "${builder.name}" and click on it`);

      // Verify builder profile page loaded
      await page.waitForURL(/.*\/marketplace\/builders\/.*/);

      const profileLoaded = await visualVerifier.verifyComponentLayout('builder profile page with session types');
      if (!profileLoaded) {
        throw new Error('Builder profile page did not load correctly');
      }

      // 4. Select a session type
      await stagehand.act(`Find the "Initial Consultation" session type card and click it`);

      // 5. Interact with Calendly embed
      await calendlyTester.selectTimeSlot(0, 0);

      // 6. Fill booking details and confirm
      await calendlyTester.fillBookingDetails({
        name: 'Test Client',
        email: testEmail
      });

      // 7. Verify booking confirmation
      const bookingConfirmed = await visualVerifier.verifyComponentLayout('booking confirmation page with booking details');
      if (!bookingConfirmed) {
        throw new Error('Booking confirmation page did not load correctly');
      }

      // 8. Proceed to payment
      await stagehand.act(`Click the proceed to payment or checkout button`);

      // 9. Complete Stripe payment
      await paymentTester.completeStripePayment();

      // 10. Verify payment success
      const paymentSuccessful = await visualVerifier.verifyComponentLayout('payment success page with booking reference');
      if (!paymentSuccessful) {
        throw new Error('Payment success page did not load correctly');
      }

      // 11. Extract booking reference for verification
      const bookingReference = await stagehand.extract(`
        Find and extract the booking reference number or confirmation code.
        Return just the reference code itself.
      `);

      console.log(`Completed booking with reference: ${bookingReference.text}`);

    } finally {
      // Clean up test data
      await dataManager.cleanup();
    }
  });