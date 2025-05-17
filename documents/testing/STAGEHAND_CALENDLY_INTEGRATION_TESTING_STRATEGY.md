  Calendly Integration Testing Strategy

  1. Calendly Test Challenges and Solutions

  // docs/calendly-test-strategy.md
  /**
   * # Calendly Integration Testing Strategy
   * 
   * ## Key Challenges
   * 
   * 1. **iFrame-based Integration**: 
   *    - Calendly loads in an iframe which creates cross-origin limitations
   *    - Standard Playwright selectors can't easily reach into the iframe
   * 
   * 2. **Dynamic UI Elements**:
   *    - Calendly's UI elements change IDs and classes between versions
   *    - Selectors can become brittle and break with Calendly updates
   * 
   * 3. **External Service Dependency**:
   *    - Tests depend on Calendly availability and API responses
   *    - API rate limits can affect test reliability
   * 
   * 4. **Webhook-driven Flow**:
   *    - Booking confirmation depends on webhook delivery
   *    - Hard to test webhook receipt in isolated environments
   * 
   * 5. **Calendar Availability**:
   *    - Real availability can change between test runs
   *    - Need consistent time slots for deterministic tests
   * 
   * ## Stagehand-based Solutions
   * 
   * 1. **AI-driven iframe Interaction**:
   *    - Use Stagehand's AI to identify and interact with elements inside the iframe
   *    - Describe elements semantically rather than using brittle selectors
   * 
   * 2. **Resilient Element Finding**:
   *    - Use visual and semantic element descriptions that don't depend on specific classes/IDs
   *    - Implement fallback strategies when elements can't be found
   * 
   * 3. **Controlled Test Environment**:
   *    - Use dedicated test Calendly account with controlled settings
   *    - Implement request caching/mocking for deterministic responses
   * 
   * 4. **Webhook Simulation**:
   *    - Implement webhook simulators to trigger events without waiting for actual callbacks
   *    - Create direct API endpoints for test-specific webhook handling
   * 
   * 5. **Availability Management**:
   *    - Use test-specific Calendly event types with guaranteed availability
   *    - Reset availability between test runs
   */

  2. Calendly-specific Test Components

  // framework/calendly/calendly-iframe-handler.ts
  /**
   * Specialized handler for Calendly iframe interactions
   */
  export class CalendlyIframeHandler {
    constructor(private page: Page, private stagehand: Stagehand) {}

    /**
     * Wait for Calendly iframe to fully load
     */
    async waitForCalendlyLoad(timeout: number = 30000): Promise<boolean> {
      try {
        // First wait for iframe to appear
        await this.page.waitForSelector('iframe[src*="calendly.com"]', { timeout });

        // Then use Stagehand to verify it's fully loaded
        const loadStatus = await this.stagehand.extract(`
          Is the Calendly scheduling widget fully loaded? Look for:
          - A calendar with dates
          - Time slots 
          - Or a booking form
          Answer with only "yes" or "no" and a brief explanation.
        `);

        return loadStatus.text.toLowerCase().includes('yes');
      } catch (error) {
        console.error('Calendly iframe load error:', error);
        return false;
      }
    }

    /**
     * Fallback for direct iframe interaction if AI methods fail
     */
    async directFrameInteraction(action: 'selectDate' | 'selectTime' | 'submitForm'): Promise<boolean> {
      try {
        const frame = this.page.frameLocator('iframe[src*="calendly.com"]');

        switch (action) {
          case 'selectDate':
            // Try multiple selector strategies for dates
            try {
              // First try current month dates that are enabled
              await frame.locator('[data-container="calendar-day"][aria-disabled="false"]').first().click();
            } catch {
              // Fallback: try any clickable date element
              await frame.locator('[role="gridcell"]:not([disabled])').first().click();
            }
            break;

          case 'selectTime':
            // Try multiple selector strategies for time slots
            try {
              // First try standard time slot buttons
              await frame.locator('button[data-start-time]').first().click();
            } catch {
              // Fallback: any element that looks like a time slot
              await frame.locator('button:has-text("AM"),button:has-text("PM")').first().click();
            }
            break;

          case 'submitForm':
            // Try multiple selector strategies for submit buttons
            try {
              // First try standard continue/schedule buttons
              await frame.locator('button[type="submit"]').click();
            } catch {
              try {
                // Try by text
                await frame.getByRole('button', { name: /schedule|confirm|continue/i }).click();
              } catch {
                // Last resort: find the most prominent button
                await frame.locator('button.primary,button.submit,button[data-primary="true"]').click();
              }
            }
            break;
        }

        return true;
      } catch (error) {
        console.error(`Direct frame interaction failed for ${action}:`, error);
        return false;
      }
    }

    /**
     * Check if there's a Calendly error showing
     */
    async checkForCalendlyError(): Promise<{ hasError: boolean, message: string }> {
      const errorCheck = await this.stagehand.extract(`
        Is there any error message or error state visible in the Calendly widget?
        If yes, describe the error message. If no, just say "no error".
      `);

      const hasError = !errorCheck.text.toLowerCase().includes('no error');

      return {
        hasError,
        message: hasError ? errorCheck.text : ''
      };
    }
  }

  3. Enhanced Calendly Tester Implementation

  // framework/calendly-tester.ts
  import { Page } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';
  import { CalendlyIframeHandler } from './calendly/calendly-iframe-handler';

  /**
   * Comprehensive Calendly testing implementation
   */
  export class CalendlyTester {
    private iframeHandler: CalendlyIframeHandler;

    constructor(private page: Page, private stagehand: Stagehand) {
      this.iframeHandler = new CalendlyIframeHandler(page, stagehand);
    }

    /**
     * Select date and time in Calendly
     * Uses resilient strategies with fallbacks
     */
    async selectTimeSlot(options: {
      dateIndex?: number;
      timeIndex?: number;
      preferredTime?: string;
      maxRetries?: number;
    } = {}): Promise<boolean> {
      const {
        dateIndex = 0,
        timeIndex = 0,
        preferredTime,
        maxRetries = 3
      } = options;

      // Wait for Calendly to load
      const isLoaded = await this.iframeHandler.waitForCalendlyLoad();
      if (!isLoaded) {
        throw new Error('Calendly widget failed to load');
      }

      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          // 1. First try: AI-based approach using descriptive instructions
          await this.stagehand.act(`
            In the Calendly widget, select a date ${dateIndex === 0 ? 'today or the first available date' : 
              `that is approximately ${dateIndex} days from today or the ${dateIndex+1}th available date`}.
          `);

          // Check for success or error
          const dateError = await this.iframeHandler.checkForCalendlyError();
          if (dateError.hasError) {
            console.log(`Date selection error: ${dateError.message}`);
            throw new Error('Date selection failed');
          }

          // Allow time for time slots to load
          await this.page.waitForTimeout(1000);

          // Select time slot with AI
          if (preferredTime) {
            await this.stagehand.act(`
              In the Calendly widget, select the time slot at or closest to ${preferredTime}.
            `);
          } else {
            await this.stagehand.act(`
              In the Calendly widget, select ${timeIndex === 0 ? 'the first' : `the ${timeIndex + 1}th`} available time slot.
            `);
          }

          // Verify time selection
          const timeSelected = await this.stagehand.extract(`
            Has a time slot been successfully selected in the Calendly widget?
            Look for visual confirmation like highlighting or a continue button becoming enabled.
            Answer with just "yes" or "no" and a brief explanation.
          `);

          success = timeSelected.text.toLowerCase().includes('yes');

          if (!success) {
            throw new Error('Time slot selection verification failed');
          }

        } catch (error) {
          console.log(`AI-based Calendly interaction failed (attempt ${retries + 1}):`, error);

          // 2. Fallback: direct iframe interaction
          if (retries === maxRetries - 1) {
            console.log('Trying direct iframe interaction as last resort');

            try {
              // Try direct interaction with iframe
              await this.iframeHandler.directFrameInteraction('selectDate');
              await this.page.waitForTimeout(1000);
              await this.iframeHandler.directFrameInteraction('selectTime');

              // Verify selection worked
              const confirmEnabled = await this.stagehand.extract(`
                Is there a highlighted time slot and an enabled continue/confirm button?
                Answer with just "yes" or "no".
              `);

              success = confirmEnabled.text.toLowerCase().includes('yes');
            } catch (fallbackError) {
              console.error('Direct iframe interaction also failed:', fallbackError);
            }
          }

          retries++;
        }
      }

      if (!success) {
        throw new Error(`Failed to select time slot after ${maxRetries} attempts`);
      }

      return success;
    }

    /**
     * Fill out the Calendly booking details form
     */
    async fillBookingDetails(details: {
      name: string;
      email: string;
      notes?: string;
      custom?: Record<string, string>;
    }): Promise<boolean> {
      try {
        // Fill basic details using AI
        await this.stagehand.act(`
          In the Calendly form, enter "${details.name}" as the name and "${details.email}" as the email.
        `);

        if (details.notes) {
          await this.stagehand.act(`
            In the Calendly form, enter "${details.notes}" in the notes or additional information field.
          `);
        }

        // Fill any custom fields
        if (details.custom) {
          for (const [label, value] of Object.entries(details.custom)) {
            await this.stagehand.act(`
              In the Calendly form, find the field labeled "${label}" or similar and enter "${value}".
            `);
          }
        }

        // Submit the form
        await this.stagehand.act(`
          In the Calendly form, click the schedule or confirm button to complete the booking.
        `);

        // If that fails, try direct interaction
        try {
          await this.page.waitForURL(/.*\/(confirmation|success|thank-you).*/i, { timeout: 10000 });
        } catch {
          console.log('Navigation after form submission not detected, trying direct submit');
          await this.iframeHandler.directFrameInteraction('submitForm');
        }

        // Wait for booking process to complete 
        await this.page.waitForURL(/.*\/(confirmation|success|thank-you).*/i, { timeout: 20000 });

        return true;
      } catch (error) {
        console.error('Failed to complete Calendly booking form:', error);
        return false;
      }
    }

    /**
     * Simulate Calendly webhook events for testing
     */
    async simulateWebhookEvent(eventType: 'scheduled' | 'canceled' | 'rescheduled', options: {
      builderId: string;
      bookingId?: string;
      signatureOverride?: string;
    }): Promise<Response> {
      const { builderId, bookingId = `test_booking_${Date.now()}`, signatureOverride } = options;

      // Generate Calendly-like webhook payload
      const payload = this.generateWebhookPayload(eventType, builderId, bookingId);

      // Generate signature or use override
      const signature = signatureOverride || this.generateCalendlySignature(payload);

      // Send webhook request
      return await fetch(`${this.page.url().split('/').slice(0, 3).join('/')}/api/webhooks/calendly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Calendly-Webhook-Signature': signature
        },
        body: JSON.stringify(payload)
      });
    }

    /**
     * Generate realistic Calendly webhook payload
     */
    private generateWebhookPayload(
      eventType: 'scheduled' | 'canceled' | 'rescheduled',
      builderId: string,
      bookingId: string
    ): any {
      const now = new Date();
      const eventStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour later

      return {
        event: `invitee.${eventType}`,
        created_at: now.toISOString(),
        payload: {
          event_type: {
            uuid: `test-event-type-${Date.now()}`,
            kind: 'One-on-One',
            slug: 'test-session',
            name: 'Test Session Type',
            duration: 60,
            owner: {
              type: 'User',
              uuid: builderId
            }
          },
          event: {
            uuid: bookingId,
            start_time: eventStart.toISOString(),
            end_time: eventEnd.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            status: eventType === 'canceled' ? 'canceled' : 'active'
          },
          invitee: {
            uuid: `test-invitee-${Date.now()}`,
            email: 'test@example.com',
            name: 'Test User',
            timezone: 'UTC',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            questions_and_answers: [],
            canceled: eventType === 'canceled',
            reschedule_url: `https://calendly.com/reschedulings/test-reschedule-${Date.now()}`
          },
          tracking: {
            utm_source: 'test',
            utm_medium: 'e2e-test',
            utm_campaign: 'stagehand-test'
          },
          old_invitee: eventType === 'rescheduled' ? {
            uuid: `test-old-invitee-${Date.now() - 10000}`,
            start_time: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()
          } : undefined
        }
      };
    }

    /**
     * Generate a valid Calendly signature
     */
    private generateCalendlySignature(payload: any): string {
      // In a real implementation, use crypto library with webhook secret
      // For tests, we use a simplified version that our API will recognize
      return `test-signature-${Date.now()}`;
    }

    /**
     * Check if Calendly has an active session
     */
    async hasActiveSession(): Promise<boolean> {
      try {
        // Look for Calendly active session indicators
        const sessionCheck = await this.stagehand.extract(`
          Does the page indicate there is an active or upcoming Calendly session?
          Look for confirmation numbers, upcoming appointment details, or calendar links.
          Answer with just "yes" or "no" and why.
        `);

        return sessionCheck.text.toLowerCase().includes('yes');
      } catch (error) {
        console.error('Error checking for active Calendly session:', error);
        return false;
      }
    }
  }
