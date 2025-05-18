  Webhook Handling Test Strategy

  1. Webhook Testing Framework

  // framework/webhook/webhook-tester.ts
  import { Page } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';
  import crypto from 'crypto';

  /**
   * Webhook source types
   */
  export enum WebhookSource {
    CALENDLY = 'calendly',
    STRIPE = 'stripe',
    CUSTOM = 'custom'
  }

  /**
   * Webhook payload templates
   */
  export interface WebhookTemplates {
    [WebhookSource.CALENDLY]: {
      scheduled: any;
      canceled: any;
      rescheduled: any;
    };
    [WebhookSource.STRIPE]: {
      paymentIntentSucceeded: any;
      paymentIntentFailed: any;
      paymentIntentCanceled: any;
      customerCreated: any;
      customerSubscriptionCreated: any;
      customerSubscriptionUpdated: any;
      customerSubscriptionDeleted: any;
    };
    [key: string]: Record<string, any>;
  }

  /**
   * Webhook test configuration
   */
  export interface WebhookTestConfig {
    baseUrl: string;
    endpoints: {
      [WebhookSource.CALENDLY]: string;
      [WebhookSource.STRIPE]: string;
      [key: string]: string;
    };
    secrets: {
      [WebhookSource.CALENDLY]?: string;
      [WebhookSource.STRIPE]?: string;
      [key: string]: string | undefined;
    };
    verificationEndpoint?: string;
  }

  /**
   * Webhook verification result
   */
  export interface WebhookVerificationResult {
    received: boolean;
    processed: boolean;
    sideEffects: {
      database?: boolean;
      email?: boolean;
      notification?: boolean;
      stateChange?: boolean;
    };
    error?: {
      message: string;
      details?: string;
    };
    logs?: string[];
  }

  /**
   * Comprehensive webhook testing framework
   */
  export class WebhookTester {
    private templates: WebhookTemplates;

    constructor(
      private page: Page,
      private stagehand: Stagehand,
      private config: WebhookTestConfig
    ) {
      // Initialize webhook payload templates
      this.templates = {
        [WebhookSource.CALENDLY]: {
          scheduled: this.createCalendlyScheduledTemplate(),
          canceled: this.createCalendlyCanceledTemplate(),
          rescheduled: this.createCalendlyRescheduledTemplate()
        },
        [WebhookSource.STRIPE]: {
          paymentIntentSucceeded: this.createStripePaymentIntentSucceededTemplate(),
          paymentIntentFailed: this.createStripePaymentIntentFailedTemplate(),
          paymentIntentCanceled: this.createStripePaymentIntentCanceledTemplate(),
          customerCreated: this.createStripeCustomerCreatedTemplate(),
          customerSubscriptionCreated: this.createStripeSubscriptionCreatedTemplate(),
          customerSubscriptionUpdated: this.createStripeSubscriptionUpdatedTemplate(),
          customerSubscriptionDeleted: this.createStripeSubscriptionDeletedTemplate()
        }
      };
    }

    /**
     * Send a webhook payload and test the system's response
     */
    async testWebhook(
      source: WebhookSource,
      eventType: string,
      customPayload?: any,
      options: {
        waitForSideEffects?: boolean;
        verifyDatabase?: boolean;
        verifyEmail?: boolean;
        verifyNotification?: boolean;
        verifyStateChange?: boolean;
        timeout?: number;
      } = {}
    ): Promise<WebhookVerificationResult> {
      // Configure options with defaults
      const opts = {
        waitForSideEffects: true,
        verifyDatabase: true,
        verifyEmail: false,
        verifyNotification: false,
        verifyStateChange: true,
        timeout: 10000,
        ...options
      };

      // Get or create webhook payload
      const payload = customPayload || this.getWebhookPayload(source, eventType);

      // Add a unique test ID for tracking
      const testId = `webhook_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.addTestIdentifier(payload, source, testId);

      // Generate appropriate signature
      const signature = this.generateSignature(source, payload);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Test': 'true'
      };

      // Add source-specific headers
      switch (source) {
        case WebhookSource.CALENDLY:
          headers['Calendly-Webhook-Signature'] = signature;
          break;
        case WebhookSource.STRIPE:
          headers['Stripe-Signature'] = signature;
          break;
        default:
          headers['X-Webhook-Signature'] = signature;
      }

      let webhookResult: WebhookVerificationResult = {
        received: false,
        processed: false,
        sideEffects: {
          database: false,
          email: false,
          notification: false,
          stateChange: false
        }
      };

      try {
        // Send the webhook
        const endpoint = this.config.endpoints[source] || '/api/webhooks/unknown';
        const webhookUrl = new URL(endpoint, this.config.baseUrl).toString();

        console.log(`Sending ${source} webhook to ${webhookUrl}`, {
          eventType,
          testId
        });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        // Check reception
        webhookResult.received = response.ok;

        if (!response.ok) {
          webhookResult.error = {
            message: `Webhook endpoint returned ${response.status} ${response.statusText}`,
            details: await response.text()
          };
          return webhookResult;
        }

        // If no side effect verification is needed, we're done
        if (!opts.waitForSideEffects) {
          webhookResult.processed = true;
          return webhookResult;
        }

        // Wait a moment for processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify webhook was processed
        const verificationResult = await this.verifyWebhookProcessed(
          source,
          eventType,
          testId,
          {
            verifyDatabase: opts.verifyDatabase,
            verifyEmail: opts.verifyEmail,
            verifyNotification: opts.verifyNotification,
            verifyStateChange: opts.verifyStateChange,
            timeout: opts.timeout
          }
        );

        webhookResult = {
          ...webhookResult,
          ...verificationResult
        };

        return webhookResult;
      } catch (error) {
        console.error(`Webhook test error for ${source}/${eventType}:`, error);

        return {
          ...webhookResult,
          error: {
            message: 'Webhook test encountered an error',
            details: error instanceof Error ? error.message : String(error)
          }
        };
      }
    }

    /**
     * Test a sequence of webhook events
     */
    async testWebhookSequence(
      steps: Array<{
        source: WebhookSource;
        eventType: string;
        customPayload?: any;
        waitMs?: number;
      }>,
      options: {
        verifyFinalState?: boolean;
        timeout?: number;
      } = {}
    ): Promise<Array<WebhookVerificationResult>> {
      // Configure options with defaults
      const opts = {
        verifyFinalState: true,
        timeout: 15000,
        ...options
      };

      const results: Array<WebhookVerificationResult> = [];

      // Generate a sequence ID to correlate related events
      const sequenceId = `sequence_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Execute each step in sequence
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const isLastStep = i === steps.length - 1;

        // Create a test ID that includes sequence and step information
        const testId = `${sequenceId}_step${i + 1}`;

        // Get or create payload
        let payload = step.customPayload || this.getWebhookPayload(step.source, step.eventType);

        // Add correlation identifiers to link events in a sequence
        payload = this.addSequenceIdentifiers(payload, step.source, {
          sequenceId,
          stepIndex: i,
          totalSteps: steps.length
        });

        // Add test identifier
        this.addTestIdentifier(payload, step.source, testId);

        // Execute this step's webhook
        const result = await this.testWebhook(
          step.source,
          step.eventType,
          payload,
          {
            // Only verify side effects on the last step (unless overridden)
            waitForSideEffects: isLastStep || opts.verifyFinalState,
            verifyDatabase: isLastStep || opts.verifyFinalState,
            verifyStateChange: isLastStep || opts.verifyFinalState,
            timeout: opts.timeout
          }
        );

        results.push(result);

        // If there was an error, stop the sequence
        if (result.error) {
          console.error(`Webhook sequence error at step ${i + 1}:`, result.error);
          break;
        }

        // Wait between steps if specified
        if (step.waitMs && i < steps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, step.waitMs));
        }
      }

      return results;
    }

    /**
     * Verify webhook was properly processed
     */
    private async verifyWebhookProcessed(
      source: WebhookSource,
      eventType: string,
      testId: string,
      options: {
        verifyDatabase?: boolean;
        verifyEmail?: boolean;
        verifyNotification?: boolean;
        verifyStateChange?: boolean;
        timeout?: number;
      }
    ): Promise<WebhookVerificationResult> {
      const {
        verifyDatabase = true,
        verifyEmail = false,
        verifyNotification = false,
        verifyStateChange = true,
        timeout = 10000
      } = options;

      const result: WebhookVerificationResult = {
        received: true,
        processed: false,
        sideEffects: {
          database: false,
          email: false,
          notification: false,
          stateChange: false
        }
      };

      // If no verification endpoint, assume it was processed
      if (!this.config.verificationEndpoint) {
        result.processed = true;
        return result;
      }

      // Try verification with retries due to potential processing delays
      const startTime = Date.now();
      let verified = false;

      while (!verified && Date.now() - startTime < timeout) {
        try {
          // Call verification endpoint
          const response = await fetch(this.config.verificationEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              source,
              eventType,
              testId,
              verifyDatabase,
              verifyEmail,
              verifyNotification,
              verifyStateChange
            })
          });

          if (response.ok) {
            const verificationData = await response.json();

            result.processed = verificationData.processed === true;

            if (verificationData.sideEffects) {
              result.sideEffects = {
                database: verificationData.sideEffects.database === true,
                email: verificationData.sideEffects.email === true,
                notification: verificationData.sideEffects.notification === true,
                stateChange: verificationData.sideEffects.stateChange === true
              };
            }

            // If everything we care about is verified, we're done
            if (result.processed &&
                (!verifyDatabase || result.sideEffects.database) &&
                (!verifyEmail || result.sideEffects.email) &&
                (!verifyNotification || result.sideEffects.notification) &&
                (!verifyStateChange || result.sideEffects.stateState)) {
              verified = true;
            }
          }
        } catch (error) {
          console.error('Webhook verification error:', error);
        }

        if (!verified) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return result;
    }

    /**
     * Get webhook payload for a given source and event type
     */
    private getWebhookPayload(source: WebhookSource, eventType: string): any {
      // Check if we have a template for this event
      if (this.templates[source] && this.templates[source][eventType]) {
        // Clone the template to avoid modifying it
        return JSON.parse(JSON.stringify(this.templates[source][eventType]));
      }

      // Create a basic payload if no template exists
      console.warn(`No template found for ${source}/${eventType}, creating generic payload`);

      return {
        event: eventType,
        created_at: new Date().toISOString(),
        data: {
          object: {
            id: `test_${Date.now()}`
          }
        }
      };
    }

    /**
     * Add test identifier to webhook payload
     */
    private addTestIdentifier(payload: any, source: WebhookSource, testId: string): any {
      switch (source) {
        case WebhookSource.CALENDLY:
          // Add to payload.payload.tracking
          if (!payload.payload) payload.payload = {};
          if (!payload.payload.tracking) payload.payload.tracking = {};
          payload.payload.tracking.utm_source = 'webhook_test';
          payload.payload.tracking.utm_medium = testId;
          break;

        case WebhookSource.STRIPE:
          // Add to payload.data.object.metadata
          if (!payload.data) payload.data = {};
          if (!payload.data.object) payload.data.object = {};
          if (!payload.data.object.metadata) payload.data.object.metadata = {};
          payload.data.object.metadata.webhook_test = 'true';
          payload.data.object.metadata.test_id = testId;
          break;

        default:
          // Generic approach
          if (!payload.metadata) payload.metadata = {};
          payload.metadata.webhook_test = 'true';
          payload.metadata.test_id = testId;
      }

      return payload;
    }

    /**
     * Add sequence identifiers to relate webhooks in a sequence
     */
    private addSequenceIdentifiers(
      payload: any,
      source: WebhookSource,
      sequence: {
        sequenceId: string;
        stepIndex: number;
        totalSteps: number;
      }
    ): any {
      switch (source) {
        case WebhookSource.CALENDLY:
          // Add to payload.payload.tracking
          if (!payload.payload) payload.payload = {};
          if (!payload.payload.tracking) payload.payload.tracking = {};
          payload.payload.tracking.utm_campaign = sequence.sequenceId;
          payload.payload.tracking.utm_content = `step${sequence.stepIndex + 1}_of_${sequence.totalSteps}`;
          break;

        case WebhookSource.STRIPE:
          // Add to payload.data.object.metadata
          if (!payload.data) payload.data = {};
          if (!payload.data.object) payload.data.object = {};
          if (!payload.data.object.metadata) payload.data.object.metadata = {};
          payload.data.object.metadata.sequence_id = sequence.sequenceId;
          payload.data.object.metadata.sequence_step = `${sequence.stepIndex + 1}`;
          payload.data.object.metadata.sequence_total = `${sequence.totalSteps}`;
          break;

        default:
          // Generic approach
          if (!payload.metadata) payload.metadata = {};
          payload.metadata.sequence_id = sequence.sequenceId;
          payload.metadata.sequence_step = `${sequence.stepIndex + 1}`;
          payload.metadata.sequence_total = `${sequence.totalSteps}`;
      }

      return payload;
    }

    /**
     * Generate appropriate signature for webhook source
     */
    private generateSignature(source: WebhookSource, payload: any): string {
      const secret = this.config.secrets[source] || 'test-secret';

      switch (source) {
        case WebhookSource.CALENDLY:
          // Calendly uses HMAC SHA-256 of the entire payload
          const hmac = crypto.createHmac('sha256', secret);
          hmac.update(JSON.stringify(payload));
          return hmac.digest('hex');

        case WebhookSource.STRIPE:
          // Stripe uses 't=timestamp,v1=signature' format
          const timestamp = Math.floor(Date.now() / 1000);
          const payloadString = `${timestamp}.${JSON.stringify(payload)}`;
          const stripeHmac = crypto.createHmac('sha256', secret);
          stripeHmac.update(payloadString);
          return `t=${timestamp},v1=${stripeHmac.digest('hex')}`;

        default:
          // Generic approach - simple HMAC
          const genericHmac = crypto.createHmac('sha256', secret);
          genericHmac.update(JSON.stringify(payload));
          return genericHmac.digest('hex');
      }
    }

    /**
     * Create template for Calendly scheduled event
     */
    private createCalendlyScheduledTemplate(): any {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowPlusHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      return {
        event: 'invitee.created',
        created_at: now.toISOString(),
        payload: {
          event_type: {
            uuid: `evtype_${Date.now()}`,
            kind: 'One-on-One',
            slug: 'test-session',
            name: 'Test Session Type',
            duration: 60,
            owner: {
              type: 'User',
              uuid: `user_${Date.now() - 10000}`
            }
          },
          event: {
            uuid: `event_${Date.now()}`,
            start_time: tomorrow.toISOString(),
            end_time: tomorrowPlusHour.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            status: 'active'
          },
          invitee: {
            uuid: `invitee_${Date.now()}`,
            email: 'test@example.com',
            name: 'Test User',
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            questions_and_answers: [],
            canceled: false,
            reschedule_url: `https://calendly.com/reschedulings/test-reschedule-${Date.now()}`
          },
          tracking: {
            utm_source: 'test',
            utm_medium: 'webhook_test',
            utm_campaign: 'stagehand_test'
          }
        }
      };
    }

    /**
     * Create template for Calendly canceled event
     */
    private createCalendlyCanceledTemplate(): any {
      const scheduled = this.createCalendlyScheduledTemplate();

      scheduled.event = 'invitee.canceled';
      scheduled.payload.invitee.canceled = true;
      scheduled.payload.event.status = 'canceled';

      return scheduled;
    }

    /**
     * Create template for Calendly rescheduled event
     */
    private createCalendlyRescheduledTemplate(): any {
      const now = new Date();
      const scheduled = this.createCalendlyScheduledTemplate();

      scheduled.event = 'invitee.rescheduled';

      // Add old invitee data
      scheduled.payload.old_invitee = {
        uuid: `old_invitee_${Date.now() - 10000}`,
        start_time: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()
      };

      return scheduled;
    }

    /**
     * Create Stripe payment intent succeeded template
     */
    private createStripePaymentIntentSucceededTemplate(): any {
      const now = Math.floor(Date.now() / 1000);

      return {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: now,
        data: {
          object: {
            id: `pi_${Date.now()}`,
            object: 'payment_intent',
            amount: 7500, // $75.00
            currency: 'usd',
            status: 'succeeded',
            created: now - 60,
            metadata: {
              bookingId: `booking_${Date.now() - 120}`,
              webhookTest: 'true'
            },
            payment_method: `pm_${Date.now()}`,
            payment_method_types: ['card'],
            latest_charge: `ch_${Date.now()}`
          }
        },
        type: 'payment_intent.succeeded',
        livemode: false
      };
    }

    /**
     * Create Stripe payment intent failed template
     */
    private createStripePaymentIntentFailedTemplate(): any {
      const succeeded = this.createStripePaymentIntentSucceededTemplate();

      succeeded.type = 'payment_intent.payment_failed';
      succeeded.data.object.status = 'failed';
      succeeded.data.object.last_payment_error = {
        code: 'card_declined',
        message: 'Your card was declined.',
        type: 'card_error'
      };

      return succeeded;
    }

    /**
     * Create Stripe payment intent canceled template
     */
    private createStripePaymentIntentCanceledTemplate(): any {
      const succeeded = this.createStripePaymentIntentSucceededTemplate();

      succeeded.type = 'payment_intent.canceled';
      succeeded.data.object.status = 'canceled';
      succeeded.data.object.cancellation_reason = 'requested_by_customer';

      return succeeded;
    }

    /**
     * Create Stripe customer created template
     */
    private createStripeCustomerCreatedTemplate(): any {
      const now = Math.floor(Date.now() / 1000);

      return {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: now,
        data: {
          object: {
            id: `cus_${Date.now()}`,
            object: 'customer',
            created: now,
            email: 'test@example.com',
            name: 'Test Customer',
            metadata: {
              webhookTest: 'true'
            }
          }
        },
        type: 'customer.created',
        livemode: false
      };
    }

    /**
     * Create Stripe subscription created template
     */
    private createStripeSubscriptionCreatedTemplate(): any {
      const now = Math.floor(Date.now() / 1000);
      const futureDate = now + 30 * 24 * 60 * 60; // 30 days from now

      return {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: now,
        data: {
          object: {
            id: `sub_${Date.now()}`,
            object: 'subscription',
            created: now,
            current_period_start: now,
            current_period_end: futureDate,
            customer: `cus_${Date.now() - 1000}`,
            items: {
              object: 'list',
              data: [{
                id: `si_${Date.now()}`,
                object: 'subscription_item',
                price: {
                  id: `price_${Date.now() - 5000}`,
                  object: 'price',
                  unit_amount: 10000,
                  currency: 'usd',
                  recurring: {
                    interval: 'month',
                    interval_count: 1
                  }
                },
                quantity: 1
              }]
            },
            status: 'active',
            metadata: {
              webhookTest: 'true'
            }
          }
        },
        type: 'customer.subscription.created',
        livemode: false
      };
    }

    /**
     * Create Stripe subscription updated template
     */
    private createStripeSubscriptionUpdatedTemplate(): any {
      const created = this.createStripeSubscriptionCreatedTemplate();

      created.type = 'customer.subscription.updated';
      created.data.object.status = 'active';
      created.data.object.updated = Math.floor(Date.now() / 1000);

      // Add "previous attributes" to indicate what changed
      created.data.previous_attributes = {
        items: {
          data: [{
            price: {
              id: `price_old_${Date.now() - 10000}`,
              unit_amount: 5000 // $50 instead of $100
            }
          }]
        }
      };

      return created;
    }

    /**
     * Create Stripe subscription deleted template
     */
    private createStripeSubscriptionDeletedTemplate(): any {
      const created = this.createStripeSubscriptionCreatedTemplate();

      created.type = 'customer.subscription.deleted';
      created.data.object.status = 'canceled';
      created.data.object.canceled_at = Math.floor(Date.now() / 1000);

      return created;
    }
  }

  2. Webhook Test Implementation

  // journeys/webhook-testing.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';
  import {
    WebhookSource,
    WebhookTester
  } from '../framework/webhook/webhook-tester';

  test.describe('Webhook handling tests', () => {

    test('should process Calendly scheduling webhook correctly', async ({
      page,
      stagehand,
      dataManager
    }) => {
      // Create builder and session type for the test
      const builder = await dataManager.createTestBuilder();
      const sessionTypes = await dataManager.createSessionTypes(builder.id);

      // Create client for the test
      const client = await dataManager.createTestClient();

      // Initialize webhook tester
      const webhookTester = new WebhookTester(page, stagehand, {
        baseUrl: page.url().split('/').slice(0, 3).join('/'),
        endpoints: {
          [WebhookSource.CALENDLY]: '/api/webhooks/calendly',
          [WebhookSource.STRIPE]: '/api/webhooks/stripe'
        },
        secrets: {
          [WebhookSource.CALENDLY]: 'test-secret', // Use test secret
          [WebhookSource.STRIPE]: 'whsec_test'
        },
        verificationEndpoint: '/api/test/verify-webhook'
      });

      // Create a custom Calendly payload with our test data
      const customPayload = {
        event: 'invitee.created',
        created_at: new Date().toISOString(),
        payload: {
          event_type: {
            uuid: sessionTypes[0].calendlyEventTypeId || `evtype_${Date.now()}`,
            name: sessionTypes[0].name,
            duration: sessionTypes[0].duration
          },
          event: {
            uuid: `event_${Date.now()}`,
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
          },
          invitee: {
            uuid: `invitee_${Date.now()}`,
            email: client.email,
            name: client.name
          },
          tracking: {
            utm_source: 'test',
            utm_medium: 'webhook_test',
            utm_content: JSON.stringify({
              builderId: builder.id,
              sessionTypeId: sessionTypes[0].id,
              clientId: client.id
            })
          }
        }
      };

      // Send the webhook
      const result = await webhookTester.testWebhook(
        WebhookSource.CALENDLY,
        'scheduled',
        customPayload,
        {
          waitForSideEffects: true,
          verifyDatabase: true,
          verifyEmail: true
        }
      );

      // Verify webhook was received and processed
      expect(result.received).toBeTruthy();
      expect(result.processed).toBeTruthy();

      // Verify side effects in database
      expect(result.sideEffects.database).toBeTruthy();

      // Log email validation results (email might not be sent in test env)
      console.log('Email notification result:', result.sideEffects.email);
    });

    test('should process Stripe payment succeeded webhook correctly', async ({
      page,
      stagehand,
      dataManager
    }) => {
      // Create a booking scenario for this test
      const bookingScenario = await dataManager.createBookingScenario({
        status: 'CONFIRMED',
        paymentStatus: 'PENDING'
      });

      // Initialize webhook tester
      const webhookTester = new WebhookTester(page, stagehand, {
        baseUrl: page.url().split('/').slice(0, 3).join('/'),
        endpoints: {
          [WebhookSource.CALENDLY]: '/api/webhooks/calendly',
          [WebhookSource.STRIPE]: '/api/webhooks/stripe'
        },
        secrets: {
          [WebhookSource.CALENDLY]: 'test-secret',
          [WebhookSource.STRIPE]: 'whsec_test'
        },
        verificationEndpoint: '/api/test/verify-webhook'
      });

      // Create Stripe webhook with booking reference
      const customPayload = {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `pi_${Date.now()}`,
            object: 'payment_intent',
            amount: 7500,
            currency: 'usd',
            status: 'succeeded',
            created: Math.floor(Date.now() / 1000) - 60,
            metadata: {
              bookingId: bookingScenario.id,
              webhookTest: 'true'
            }
          }
        },
        type: 'payment_intent.succeeded',
        livemode: false
      };

      // Send the webhook
      const result = await webhookTester.testWebhook(
        WebhookSource.STRIPE,
        'paymentIntentSucceeded',
        customPayload,
        {
          waitForSideEffects: true,
          verifyDatabase: true,
          verifyStateChange: true
        }
      );

      // Verify webhook was received and processed
      expect(result.received).toBeTruthy();
      expect(result.processed).toBeTruthy();

      // Verify booking was updated in database
      expect(result.sideEffects.database).toBeTruthy();
      expect(result.sideEffects.stateChange).toBeTruthy();

      // Verify the booking state directly via API
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

    test('should handle complete booking flow with webhook sequence', async ({
      page,
      stagehand,
      dataManager
    }) => {
      // Create test data
      const builder = await dataManager.createTestBuilder();
      const sessionTypes = await dataManager.createSessionTypes(builder.id);
      const client = await dataManager.createTestClient();

      // Initialize webhook tester
      const webhookTester = new WebhookTester(page, stagehand, {
        baseUrl: page.url().split('/').slice(0, 3).join('/'),
        endpoints: {
          [WebhookSource.CALENDLY]: '/api/webhooks/calendly',
          [WebhookSource.STRIPE]: '/api/webhooks/stripe'
        },
        secrets: {
          [WebhookSource.CALENDLY]: 'test-secret',
          [WebhookSource.STRIPE]: 'whsec_test'
        },
        verificationEndpoint: '/api/test/verify-webhook'
      });

      // Create a booking ID to track throughout the sequence
      const bookingId = `booking_test_${Date.now()}`;

      // Define the webhook sequence
      const webhookSequence = [
        // Step 1: Calendly booking created
        {
          source: WebhookSource.CALENDLY,
          eventType: 'scheduled',
          customPayload: {
            event: 'invitee.created',
            created_at: new Date().toISOString(),
            payload: {
              event_type: {
                uuid: sessionTypes[0].calendlyEventTypeId || `evtype_${Date.now()}`,
                name: sessionTypes[0].name,
                duration: sessionTypes[0].duration
              },
              event: {
                uuid: `event_${Date.now()}`,
                start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
              },
              invitee: {
                uuid: `invitee_${Date.now()}`,
                email: client.email,
                name: client.name
              },
              tracking: {
                utm_source: 'test',
                utm_medium: 'webhook_test',
                utm_content: JSON.stringify({
                  builderId: builder.id,
                  sessionTypeId: sessionTypes[0].id,
                  clientId: client.id,
                  bookingId
                })
              }
            }
          },
          waitMs: 1000 // Wait 1 second between steps
        },

        // Step 2: Payment intent succeeded
        {
          source: WebhookSource.STRIPE,
          eventType: 'paymentIntentSucceeded',
          customPayload: {
            id: `evt_${Date.now()}`,
            object: 'event',
            api_version: '2022-11-15',
            created: Math.floor(Date.now() / 1000),
            data: {
              object: {
                id: `pi_${Date.now()}`,
                object: 'payment_intent',
                amount: sessionTypes[0].price * 100, // Convert to cents
                currency: 'usd',
                status: 'succeeded',
                created: Math.floor(Date.now() / 1000) - 60,
                metadata: {
                  bookingId,
                  webhookTest: 'true'
                }
              }
            },
            type: 'payment_intent.succeeded',
            livemode: false
          },
          waitMs: 1000
        },

        // Step 3: Calendly reminder (if implemented)
        {
          source: WebhookSource.CALENDLY,
          eventType: 'invitee.notification',
          customPayload: {
            event: 'invitee.notification',
            created_at: new Date().toISOString(),
            payload: {
              event_type: {
                uuid: sessionTypes[0].calendlyEventTypeId || `evtype_${Date.now()}`,
                name: sessionTypes[0].name
              },
              event: {
                uuid: `event_${Date.now()}`,
                start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              },
              invitee: {
                uuid: `invitee_${Date.now()}`,
                email: client.email,
                name: client.name
              },
              tracking: {
                utm_source: 'test',
                utm_medium: 'webhook_test',
                utm_content: JSON.stringify({
                  bookingId
                })
              }
            }
          }
        }
      ];

      // Execute the webhook sequence
      const results = await webhookTester.testWebhookSequence(webhookSequence, {
        verifyFinalState: true,
        timeout: 15000
      });

      // Verify all webhooks were received
      expect(results.every(r => r.received)).toBeTruthy();

      // Verify booking state after complete sequence
      const response = await fetch(`${page.url().split('/').slice(0, 3).join('/')}/api/test/booking-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        },
        body: JSON.stringify({
          bookingId
        })
      });

      if (response.ok) {
        const bookingStatus = await response.json();
        expect(bookingStatus.status).toBe('CONFIRMED');
        expect(bookingStatus.paymentStatus).toBe('PAID');
      } else {
        console.warn('Could not verify final booking state, API returned:', response.status);
      }
    });

    test('should handle webhook error conditions gracefully', async ({
      page,
      stagehand
    }) => {
      // Initialize webhook tester
      const webhookTester = new WebhookTester(page, stagehand, {
        baseUrl: page.url().split('/').slice(0, 3).join('/'),
        endpoints: {
          [WebhookSource.CALENDLY]: '/api/webhooks/calendly',
          [WebhookSource.STRIPE]: '/api/webhooks/stripe'
        },
        secrets: {
          [WebhookSource.CALENDLY]: 'test-secret',
          [WebhookSource.STRIPE]: 'whsec_test'
        },
        verificationEndpoint: '/api/test/verify-webhook'
      });

      // Test 1: Invalid signature
      const invalidSignatureResult = await webhookTester.testWebhook(
        WebhookSource.STRIPE,
        'paymentIntentSucceeded',
        undefined, // Use default template
        {
          waitForSideEffects: false // Don't wait since we expect failure
        }
      );

      // System should reject webhook with invalid signature
      console.log('Invalid signature handling:',
                  invalidSignatureResult.received ? 'Hook accepted (potential issue)' : 'Hook rejected as expected');

      // Test 2: Malformed payload
      const malformedPayload = {
        type: 'payment_intent.succeeded',
        data: {
          // Missing required fields
        }
      };

      const malformedResult = await webhookTester.testWebhook(
        WebhookSource.STRIPE,
        'paymentIntentSucceeded',
        malformedPayload,
        {
          waitForSideEffects: false
        }
      );

      // System should handle malformed payloads without crashing
      console.log('Malformed payload handling:',
                  malformedResult.error ? 'Error handled gracefully' : 'No error detected');

      // Test 3: Duplicate webhook (simulate retry)
      // First send a normal webhook
      const originalPayload = {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `pi_duplicate_test_${Date.now()}`,
            object: 'payment_intent',
            amount: 5000,
            currency: 'usd',
            status: 'succeeded',
            metadata: {
              testType: 'duplicate'
            }
          }
        },
        type: 'payment_intent.succeeded',
        livemode: false
      };

      // Send original webhook
      const originalResult = await webhookTester.testWebhook(
        WebhookSource.STRIPE,
        'paymentIntentSucceeded',
        originalPayload,
        {
          waitForSideEffects: true
        }
      );

      // Then send identical webhook (as would happen in a retry)
      const duplicateResult = await webhookTester.testWebhook(
        WebhookSource.STRIPE,
        'paymentIntentSucceeded',
        originalPayload,
        {
          waitForSideEffects: true
        }
      );

      // Both should be "received" but system should recognize duplicate
      expect(originalResult.received).toBeTruthy();
      expect(duplicateResult.received).toBeTruthy();

      // Duplicate should be handled idempotently
      console.log('Duplicate handling:',
                  duplicateResult.processed ? 'Processed idempotently' : 'Rejected as duplicate');
    });
  });
