  Stripe Payment Verification Strategy

  1. Stripe Test Payment Validator

  // framework/stripe/payment-validator.ts
  import { Page } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';

  /**
   * Payment status to verify
   */
  export enum PaymentStatus {
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    PENDING = 'pending',
    CANCELED = 'canceled',
    REFUNDED = 'refunded'
  }

  /**
   * Verification points in the payment flow
   */
  export enum VerificationPoint {
    CHECKOUT_PAGE = 'checkout_page',
    PAYMENT_FORM = 'payment_form',
    SUCCESS_PAGE = 'success_page',
    ERROR_PAGE = 'error_page',
    CONFIRMATION_EMAIL = 'confirmation_email',
    DATABASE_RECORD = 'database_record',
    WEBHOOK_RECEIPT = 'webhook_receipt'
  }

  /**
   * Stripe test card details
   */
  export const TestCards = {
    SUCCESSFUL: {
      number: '4242424242424242',
      expiry: '12/29',
      cvc: '123'
    },
    DECLINED: {
      number: '4000000000000002',
      expiry: '12/29',
      cvc: '123'
    },
    REQUIRES_AUTHENTICATION: {
      number: '4000002500003155',
      expiry: '12/29',
      cvc: '123'
    },
    INSUFFICIENT_FUNDS: {
      number: '4000000000009995',
      expiry: '12/29',
      cvc: '123'
    },
    PROCESSING_ERROR: {
      number: '4000000000000119',
      expiry: '12/29',
      cvc: '123'
    }
  };

  /**
   * Stripe Payment Validator for Stagehand tests
   */
  export class StripePaymentValidator {
    constructor(
      private page: Page, 
      private stagehand: Stagehand,
      private options: {
        baseUrl?: string;
        webhookEndpoint?: string;
        testMode?: boolean;
      } = {}
    ) {
      this.options.baseUrl = this.options.baseUrl || 'http://localhost:3000';
      this.options.webhookEndpoint = this.options.webhookEndpoint || '/api/webhooks/stripe';
      this.options.testMode = this.options.testMode !== false;
    }

    /**
     * Verify payment UI elements and state
     */
    async verifyPaymentUI(
      verificationPoint: VerificationPoint,
      expectedAmount?: number,
      currency: string = 'USD'
    ): Promise<boolean> {
      switch (verificationPoint) {
        case VerificationPoint.CHECKOUT_PAGE:
          return this.verifyCheckoutPage(expectedAmount, currency);

        case VerificationPoint.PAYMENT_FORM:
          return this.verifyPaymentForm();

        case VerificationPoint.SUCCESS_PAGE:
          return this.verifySuccessPage(expectedAmount, currency);

        case VerificationPoint.ERROR_PAGE:
          return this.verifyErrorPage();

        default:
          throw new Error(`UI verification not implemented for ${verificationPoint}`);
      }
    }

    /**
     * Complete a payment with test card
     */
    async completePayment(
      cardDetails: typeof TestCards.SUCCESSFUL = TestCards.SUCCESSFUL,
      expectedOutcome: PaymentStatus = PaymentStatus.SUCCEEDED
    ): Promise<boolean> {
      try {
        // Wait for Stripe iframe to load
        await this.page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 15000 });

        // Fill payment details using AI
        await this.stagehand.act(`
          Enter the credit card number "${cardDetails.number}" in the payment form
        `);

        await this.stagehand.act(`
          Enter the expiration date "${cardDetails.expiry}" in the payment form
        `);

        await this.stagehand.act(`
          Enter the CVC code "${cardDetails.cvc}" in the payment form
        `);

        // Check if billing address fields are present
        const hasBillingFields = await this.stagehand.extract(`
          Are there billing address fields visible in the payment form?
          Answer with just "yes" or "no" and briefly explain what you see.
        `);

        if (hasBillingFields.text.toLowerCase().includes('yes')) {
          await this.stagehand.act(`
            Fill in the billing address fields with test data:
            - Name: "Test User"
            - Address: "123 Test St"
            - City: "Test City"
            - Zip/Postal Code: "12345"
            - Country: Select "United States" if available
          `);
        }

        // Submit payment
        await this.stagehand.act(`
          Click the submit button, pay button, or confirm button to complete the payment
        `);

        // Handle 3D Secure authentication if needed
        if (cardDetails.number === TestCards.REQUIRES_AUTHENTICATION.number) {
          await this.handle3DSecure();
        }

        // Wait for redirect or response based on expected outcome
        if (expectedOutcome === PaymentStatus.SUCCEEDED) {
          await this.page.waitForURL(/.*\/(success|confirmation|thank-you).*/i, { timeout: 30000 });
          return await this.verifySuccessPage();
        } else {
          // For failed payments, we might stay on the same page or go to an error page
          const paymentFailed = await this.stagehand.extract(`
            Is there an error message indicating payment failure?
            Answer with just "yes" or "no" and briefly explain what you see.
          `);

          return paymentFailed.text.toLowerCase().includes('yes');
        }
      } catch (error) {
        console.error('Payment completion error:', error);
        return false;
      }
    }

    /**
     * Handle 3D Secure authentication flow
     */
    private async handle3DSecure(): Promise<void> {
      try {
        // Wait for 3D Secure iframe or redirect
        await this.page.waitForURL(/.*stripe.com\/.*\/3d_secure.*/i, { timeout: 10000 })
          .catch(() => {
            console.log('No URL change for 3D Secure, looking for iframe');
          });

        // Use AI to identify and complete 3D Secure
        await this.stagehand.act(`
          Look for a 3D Secure authentication dialog, iframe, or challenge.
          If found, click the "Complete" or "Authenticate" button to approve it.
        `);

        // Wait a moment for processing
        await this.page.waitForTimeout(2000);

        // Check if we're still on the 3D Secure page
        const still3DS = await this.stagehand.extract(`
          Are we still on a 3D Secure authentication page?
          Answer with just "yes" or "no".
        `);

        if (still3DS.text.toLowerCase().includes('yes')) {
          // Try more explicit interaction
          await this.stagehand.act(`
            Find and click the button labeled "Complete", "Authenticate", or "Confirm" to complete the 3D Secure challenge
          `);
        }
      } catch (error) {
        console.error('Error handling 3D Secure authentication:', error);
        throw error;
      }
    }

    /**
     * Verify payment in backend systems
     */
    async verifyPaymentBackend(
      paymentId: string,
      expectedStatus: PaymentStatus,
      options: {
        verifyDatabase?: boolean;
        verifyWebhook?: boolean;
      } = {}
    ): Promise<boolean> {
      const results: Record<string, boolean> = {};

      if (options.verifyDatabase) {
        results.database = await this.verifyDatabaseRecord(paymentId, expectedStatus);
      }

      if (options.verifyWebhook) {
        results.webhook = await this.verifyWebhookReceived(paymentId, expectedStatus);
      }

      // If no specific checks requested, return true
      if (Object.keys(results).length === 0) {
        return true;
      }

      // Return true only if all requested checks passed
      return Object.values(results).every(result => result);
    }

    /**
     * Simulate a Stripe webhook event for testing
     */
    async simulateWebhook(
      eventType: string,
      paymentIntentId: string,
      options: {
        amount?: number;
        status?: PaymentStatus;
        metadata?: Record<string, string>;
      } = {}
    ): Promise<Response> {
      const { amount = 1000, status = PaymentStatus.SUCCEEDED, metadata = {} } = options;

      // Create a realistic webhook payload
      const payload = this.createWebhookPayload(eventType, paymentIntentId, amount, status, metadata);

      // Generate a test signature
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = `t=${timestamp},v1=test_signature_${Date.now()}`;

      // Send the webhook request
      return await fetch(`${this.options.baseUrl}${this.options.webhookEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature
        },
        body: JSON.stringify(payload)
      });
    }

    /**
     * Extract payment details from page for verification
     */
    async extractPaymentDetails(): Promise<{
      paymentId?: string;
      amount?: number;
      currency?: string;
      status?: PaymentStatus;
    }> {
      try {
        // Use Stagehand to extract payment details from the page
        const details = await this.stagehand.extract(`
          Find and extract payment details from this page including:
          - Payment ID/reference number (if visible)
          - Payment amount and currency
          - Payment status (succeeded, failed, pending)
          
          Format the answer as:
          Payment ID: [ID]
          Amount: [AMOUNT]
          Currency: [CURRENCY]
          Status: [STATUS]
        `);

        // Parse the extracted text
        const text = details.text;
        const paymentId = (text.match(/Payment ID:?\s*([A-Za-z0-9_-]+)/i) || [])[1];

        // Extract amount with regex that handles different formats
        const amountMatch = text.match(/Amount:?\s*[$£€]?\s*([0-9,.]+)/i);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

        const currency = (text.match(/Currency:?\s*([A-Z]{3})/i) || [])[1];

        // Map status text to enum
        let status: PaymentStatus | undefined;
        if (/success|succeeded|completed|paid/i.test(text)) {
          status = PaymentStatus.SUCCEEDED;
        } else if (/fail|failed|declined|rejected/i.test(text)) {
          status = PaymentStatus.FAILED;
        } else if (/pending|processing|waiting/i.test(text)) {
          status = PaymentStatus.PENDING;
        } else if (/cancel|canceled|cancelled/i.test(text)) {
          status = PaymentStatus.CANCELED;
        } else if (/refund|refunded/i.test(text)) {
          status = PaymentStatus.REFUNDED;
        }

        return { paymentId, amount, currency, status };
      } catch (error) {
        console.error('Error extracting payment details:', error);
        return {};
      }
    }

    /**
     * Private helper methods
     */

    // Verify checkout page and payment elements
    private async verifyCheckoutPage(expectedAmount?: number, currency: string = 'USD'): Promise<boolean> {
      const checkoutVerification = await this.stagehand.extract(`
        Verify this is a checkout or payment page with the following criteria:
        ${expectedAmount ? `- Shows payment amount of ${expectedAmount} ${currency}` : ''}
        - Has payment form elements (card fields)
        - Has a payment/submit button
        
        Is this a valid checkout page meeting these criteria?
        Answer with just "yes" or "no" and briefly explain why.
      `);

      return checkoutVerification.text.toLowerCase().includes('yes');
    }

    // Verify Stripe Elements payment form
    private async verifyPaymentForm(): Promise<boolean> {
      // Check for Stripe iframe
      const hasStripeFrame = await this.page.locator('iframe[name^="__privateStripeFrame"]').count() > 0;

      if (!hasStripeFrame) {
        return false;
      }

      // Use AI to verify card fields and submit button
      const formVerification = await this.stagehand.extract(`
        Verify the payment form has the following elements:
        - Credit card number field
        - Expiration date field
        - CVC/security code field
        - Submit/Pay button
        
        Are all these elements present in the payment form?
        Answer with just "yes" or "no" and briefly explain why.
      `);

      return formVerification.text.toLowerCase().includes('yes');
    }

    // Verify success page
    private async verifySuccessPage(expectedAmount?: number, currency: string = 'USD'): Promise<boolean> {
      const successVerification = await this.stagehand.extract(`
        Verify this is a payment success or confirmation page with the following criteria:
        - Shows clear success message or confirmation
        ${expectedAmount ? `- Shows payment amount of ${expectedAmount} ${currency}` : ''}
        - Shows payment/booking reference number
        
        Is this a valid success page meeting these criteria?
        Answer with just "yes" or "no" and briefly explain why.
      `);

      return successVerification.text.toLowerCase().includes('yes');
    }

    // Verify error page
    private async verifyErrorPage(): Promise<boolean> {
      const errorVerification = await this.stagehand.extract(`
        Verify this is a payment error or declined page with the following criteria:
        - Shows clear error message
        - Indicates payment was not successful
        - Possibly offers retry options
        
        Is this a payment error page meeting these criteria?
        Answer with just "yes" or "no" and briefly explain why.
      `);

      return errorVerification.text.toLowerCase().includes('yes');
    }

    // Verify database record
    private async verifyDatabaseRecord(paymentId: string, expectedStatus: PaymentStatus): Promise<boolean> {
      // In real implementation, would query database or API
      // For now, simulate with test API endpoint
      try {
        const response = await fetch(`${this.options.baseUrl}/api/test/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': this.options.testMode ? 'true' : 'false'
          },
          body: JSON.stringify({
            paymentId,
            expectedStatus
          })
        });

        if (!response.ok) {
          return false;
        }

        const result = await response.json();
        return result.verified === true;
      } catch (error) {
        console.error('Error verifying payment database record:', error);
        return false;
      }
    }

    // Verify webhook received
    private async verifyWebhookReceived(paymentId: string, expectedStatus: PaymentStatus): Promise<boolean> {
      try {
        const response = await fetch(`${this.options.baseUrl}/api/test/verify-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': this.options.testMode ? 'true' : 'false'
          },
          body: JSON.stringify({
            paymentId,
            expectedStatus,
            type: `payment_intent.${expectedStatus}`
          })
        });

        if (!response.ok) {
          return false;
        }

        const result = await response.json();
        return result.received === true;
      } catch (error) {
        console.error('Error verifying webhook receipt:', error);
        return false;
      }
    }

    // Create a realistic webhook payload
    private createWebhookPayload(
      eventType: string,
      paymentIntentId: string,
      amount: number,
      status: PaymentStatus,
      metadata: Record<string, string>
    ): any {
      const now = Math.floor(Date.now() / 1000);

      return {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: now,
        data: {
          object: {
            id: paymentIntentId,
            object: 'payment_intent',
            amount: amount,
            currency: 'usd',
            status: status,
            created: now - 60,
            metadata: {
              test: 'true',
              ...metadata
            },
            payment_method: `pm_${Date.now()}`,
            payment_method_types: ['card'],
            latest_charge: `ch_${Date.now()}`
          }
        },
        type: eventType,
        livemode: false
      };
    }
  }

  2. Stripe Test Implementation

  // journeys/payment-journey.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';
  import {
    PaymentStatus,
    TestCards,
    VerificationPoint
  } from '../framework/stripe/payment-validator';

  test.describe('Stripe payment verification journeys', () => {

    test('should process successful payment with verification', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      paymentTester
    }) => {
      // Create test data including builder, session type
      const builder = await dataManager.createTestBuilder();
      const sessionTypes = await dataManager.createSessionTypes(builder.id);

      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Create booking scenario and get to payment page
      const bookingScenario = await dataManager.createBookingScenario({
        builderId: builder.id,
        sessionTypeId: sessionTypes[0].id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        amount: 75,
        currency: 'USD'
      });

      // Navigate directly to payment page
      await page.goto(`/payment/checkout/${bookingScenario.id}`);

      // Verify checkout page
      const isValidCheckout = await paymentTester.verifyPaymentUI(
        VerificationPoint.CHECKOUT_PAGE,
        75,
        'USD'
      );
      expect(isValidCheckout).toBeTruthy();

      // Verify payment form elements
      const hasPaymentForm = await paymentTester.verifyPaymentUI(
        VerificationPoint.PAYMENT_FORM
      );
      expect(hasPaymentForm).toBeTruthy();

      // Complete payment with success card
      await paymentTester.completePayment(TestCards.SUCCESSFUL, PaymentStatus.SUCCEEDED);

      // Verify success page
      const isSuccessPage = await paymentTester.verifyPaymentUI(
        VerificationPoint.SUCCESS_PAGE,
        75,
        'USD'
      );
      expect(isSuccessPage).toBeTruthy();

      // Extract payment details for verification
      const paymentDetails = await paymentTester.extractPaymentDetails();
      expect(paymentDetails.paymentId).toBeDefined();
      expect(paymentDetails.status).toBe(PaymentStatus.SUCCEEDED);

      // Verify backend records if appropriate
      if (paymentDetails.paymentId) {
        const backendVerified = await paymentTester.verifyPaymentBackend(
          paymentDetails.paymentId,
          PaymentStatus.SUCCEEDED,
          { verifyDatabase: true }
        );
        expect(backendVerified).toBeTruthy();
      }
    });

    test('should handle declined payment', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      paymentTester
    }) => {
      // Setup test data
      const builder = await dataManager.createTestBuilder();
      const sessionTypes = await dataManager.createSessionTypes(builder.id);

      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Create booking scenario and get to payment page
      const bookingScenario = await dataManager.createBookingScenario({
        builderId: builder.id,
        sessionTypeId: sessionTypes[0].id,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      });

      // Navigate directly to payment page
      await page.goto(`/payment/checkout/${bookingScenario.id}`);

      // Complete payment with declined card
      await paymentTester.completePayment(TestCards.DECLINED, PaymentStatus.FAILED);

      // Verify error is shown
      const isErrorShown = await paymentTester.verifyPaymentUI(
        VerificationPoint.ERROR_PAGE
      );
      expect(isErrorShown).toBeTruthy();

      // Extract payment details
      const paymentDetails = await paymentTester.extractPaymentDetails();
      expect(paymentDetails.status).toBe(PaymentStatus.FAILED);
    });

    test('should handle 3D Secure authentication', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      paymentTester
    }) => {
      // Setup test data
      const builder = await dataManager.createTestBuilder();
      const sessionTypes = await dataManager.createSessionTypes(builder.id);

      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Create booking scenario and get to payment page
      const bookingScenario = await dataManager.createBookingScenario({
        builderId: builder.id,
        sessionTypeId: sessionTypes[0].id,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      });

      // Navigate directly to payment page
      await page.goto(`/payment/checkout/${bookingScenario.id}`);

      // Complete payment with 3DS card
      await paymentTester.completePayment(
        TestCards.REQUIRES_AUTHENTICATION,
        PaymentStatus.SUCCEEDED
      );

      // Verify success page
      const isSuccessPage = await paymentTester.verifyPaymentUI(
        VerificationPoint.SUCCESS_PAGE
      );
      expect(isSuccessPage).toBeTruthy();
    });

    test('should process webhook events correctly', async ({
      page,
      stagehand,
      authManager,
      dataManager,
      paymentTester
    }) => {
      // Create test booking without payment
      const bookingScenario = await dataManager.createBookingScenario({
        status: 'PENDING',
        paymentStatus: 'PENDING'
      });

      // Generate payment ID
      const paymentId = `pi_test_${Date.now()}`;

      // Simulate webhook for payment success
      const webhookResponse = await paymentTester.simulateWebhook(
        'payment_intent.succeeded',
        paymentId,
        {
          amount: 7500, // $75.00
          status: PaymentStatus.SUCCEEDED,
          metadata: {
            bookingId: bookingScenario.id,
            testMode: 'true'
          }
        }
      );

      expect(webhookResponse.ok).toBeTruthy();

      // Verify webhook was processed
      const webhookVerified = await paymentTester.verifyPaymentBackend(
        paymentId,
        PaymentStatus.SUCCEEDED,
        { verifyWebhook: true }
      );

      expect(webhookVerified).toBeTruthy();

      // Verify booking status was updated by webhook
      // This requires an API endpoint to check booking status
      const response = await fetch(`${page.url().split('/').slice(0, 3).join('/')}/api/test/booking-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        },
        body: JSON.stringify({
          bookingId: bookingScenario.id
        })
      });

      const bookingStatus = await response.json();
      expect(bookingStatus.paymentStatus).toBe('PAID');
    });
  });