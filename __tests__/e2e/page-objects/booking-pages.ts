/**
 * Booking Page Objects
 * 
 * These page objects handle the booking flow, calendly integration, and payment
 */
import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class BookingPage extends BasePage {
  // Selectors
  private datePickerSelector = '[data-testid="date-picker"]';
  private timeSlotSelector = '[data-testid="time-slot"]';
  private calendarSelector = '[data-testid="booking-calendar"]';
  private nextMonthSelector = '[data-testid="next-month"]';
  private confirmButtonSelector = '[data-testid="confirm-booking"]';
  private cancelButtonSelector = '[data-testid="cancel-booking"]';
  private bookingDetailsSelector = '[data-testid="booking-details"]';
  private sessionTypeSelector = '[data-testid="session-type-selector"]';
  private timezoneSelector = '[data-testid="timezone-selector"]';
  
  // State tracking
  private bookingId: string | null = null;

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to booking page for a specific session type
   */
  async navigateToBooking(sessionTypeId: string): Promise<void> {
    await this.navigateTo(`/book/${sessionTypeId}`);
  }

  /**
   * Get stored booking ID (set after booking creation)
   */
  getBookingId(): string | null {
    return this.bookingId;
  }

  /**
   * Set booking ID from URL or response
   */
  async extractBookingIdFromUrl(): Promise<string | null> {
    const url = await this.getCurrentUrl();
    const match = url.match(/[\?&]bookingId=([^&]+)/);
    
    if (match && match[1]) {
      this.bookingId = match[1];
      return this.bookingId;
    }
    
    return null;
  }

  /**
   * Select date from calendar
   */
  async selectDate(date: Date | 'next-available'): Promise<void> {
    if (date === 'next-available') {
      // Click the first available date
      await this.clickElement(`${this.datePickerSelector} [data-available="true"]`);
    } else {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      await this.clickElement(`${this.datePickerSelector} [data-date="${formattedDate}"]`);
    }
    
    await this.waitForPageLoad();
  }

  /**
   * Navigate to next month in calendar
   */
  async goToNextMonth(): Promise<void> {
    await this.clickElement(this.nextMonthSelector);
    await this.waitForPageLoad();
  }

  /**
   * Select time slot by index
   */
  async selectTimeSlot(index: number = 0): Promise<void> {
    await this.page.locator(this.timeSlotSelector).nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Select time slot by time string
   */
  async selectTimeSlotByTime(time: string): Promise<void> {
    await this.page.locator(`${this.timeSlotSelector}:has-text("${time}")`).click();
    await this.waitForPageLoad();
  }

  /**
   * Select timezone
   */
  async selectTimezone(timezone: string): Promise<void> {
    await this.page.selectOption(this.timezoneSelector, timezone);
    await this.waitForPageLoad();
  }

  /**
   * Confirm booking
   */
  async confirmBooking(): Promise<void> {
    await this.clickElement(this.confirmButtonSelector);
    await this.waitForNavigation(/.*\/(booking\/confirmation|payment)/);
    
    // Try to extract booking ID
    await this.extractBookingIdFromUrl();
  }

  /**
   * Cancel booking process
   */
  async cancelBooking(): Promise<void> {
    await this.clickElement(this.cancelButtonSelector);
    await this.waitForNavigation();
  }

  /**
   * Continue to payment
   */
  async continueToPayment(): Promise<void> {
    await this.clickElement('[data-testid="continue-to-payment"]');
    await this.waitForNavigation(/.*\/payment/);
  }

  /**
   * Get booking details
   */
  async getBookingDetails(): Promise<{
    sessionType: string | null;
    date: string | null;
    time: string | null;
    duration: string | null;
    builder: string | null;
  }> {
    const details = this.page.locator(this.bookingDetailsSelector);
    
    return {
      sessionType: await this.getElementText('[data-testid="session-type"]'),
      date: await this.getElementText('[data-testid="booking-date"]'),
      time: await this.getElementText('[data-testid="booking-time"]'),
      duration: await this.getElementText('[data-testid="booking-duration"]'),
      builder: await this.getElementText('[data-testid="builder-name"]'),
    };
  }
}

export class CalendlyBookingPage extends BasePage {
  // Selectors
  private calendlyEmbedSelector = '[data-testid="calendly-embed"]';
  private sessionTypeSelectorSelector = '[data-testid="calendly-session-type-selector"]';
  private confirmButtonSelector = '[data-testid="confirm-booking-button"]';
  private timeSlotOptionSelector = '[data-testid="time-slot-option"]';
  
  // State tracking
  private bookingId: string | null = null;

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Calendly booking page
   */
  async navigateToCalendlyBooking(sessionTypeId: string): Promise<void> {
    await this.navigateTo(`/book/${sessionTypeId}`);
    await this.waitForElement(this.calendlyEmbedSelector);
  }

  /**
   * Get stored booking ID
   */
  getBookingId(): string | null {
    return this.bookingId;
  }

  /**
   * Wait for Calendly embed to load
   */
  async waitForCalendlyEmbed(): Promise<void> {
    await this.waitForElement(this.calendlyEmbedSelector);
    
    // Additional wait for embed to be interactive
    await this.page.waitForFunction(() => {
      const embed = document.querySelector('[data-testid="calendly-embed"]');
      return embed && embed.querySelector('iframe') && !embed.querySelector('.calendly-loading');
    });
  }

  /**
   * Select Calendly session type
   */
  async selectSessionType(name: string): Promise<void> {
    await this.waitForCalendlyEmbed();
    await this.page.locator(`${this.sessionTypeSelectorSelector}:has-text("${name}")`).click();
    await this.waitForPageLoad();
  }

  /**
   * Select time slot in Calendly
   */
  async selectTimeSlot(index: number = 0): Promise<void> {
    await this.waitForCalendlyEmbed();
    
    // Using the mock implementation for tests
    await this.page.locator(this.timeSlotOptionSelector).nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Confirm Calendly booking
   */
  async confirmBooking(): Promise<void> {
    await this.clickElement(this.confirmButtonSelector);
    
    // Wait for confirmation page
    await this.waitForNavigation(/.*\/booking\/confirmation/);
    
    // Extract booking ID from URL if available
    const url = await this.getCurrentUrl();
    const match = url.match(/[\?&]bookingId=([^&]+)/);
    
    if (match && match[1]) {
      this.bookingId = match[1];
    }
  }

  /**
   * Check if Calendly embed is loaded correctly
   */
  async isCalendlyLoaded(): Promise<boolean> {
    return await this.isElementVisible(`${this.calendlyEmbedSelector} iframe`);
  }
}

export class PaymentPage extends BasePage {
  // Selectors
  private cardNumberSelector = '[data-testid="card-number"]';
  private cardExpirySelector = '[data-testid="card-expiry"]';
  private cardCvcSelector = '[data-testid="card-cvc"]';
  private cardholderNameSelector = '[data-testid="cardholder-name"]';
  private paymentButtonSelector = '[data-testid="submit-payment"]';
  private paymentErrorSelector = '[data-testid="payment-error"]';
  private paymentSuccessSelector = '[data-testid="payment-success"]';
  private bookingSummarySelector = '[data-testid="booking-summary"]';
  private priceSelector = '[data-testid="payment-amount"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to payment page for a booking
   */
  async navigateToPayment(bookingId: string): Promise<void> {
    await this.navigateTo(`/payment?bookingId=${bookingId}`);
  }

  /**
   * Fill payment details
   */
  async fillPaymentDetails(details: {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    name?: string;
  } = {}): Promise<void> {
    // Default to test card if not provided
    const cardNumber = details.cardNumber || '4242424242424242';
    const expiry = details.expiry || '12/30';
    const cvc = details.cvc || '123';
    const name = details.name || 'Test User';
    
    // Handle Stripe iframe if present
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]');
    
    if (await stripeFrame.count() > 0) {
      // Fill Stripe iframe fields
      await stripeFrame.locator(this.cardNumberSelector).fill(cardNumber);
      await stripeFrame.locator(this.cardExpirySelector).fill(expiry);
      await stripeFrame.locator(this.cardCvcSelector).fill(cvc);
      
      // Cardholder name is usually outside the iframe
      if (await this.isElementVisible(this.cardholderNameSelector)) {
        await this.fillField(this.cardholderNameSelector, name);
      }
    } else {
      // Direct form fields (for test mocking)
      await this.fillField(this.cardNumberSelector, cardNumber);
      await this.fillField(this.cardExpirySelector, expiry);
      await this.fillField(this.cardCvcSelector, cvc);
      
      if (await this.isElementVisible(this.cardholderNameSelector)) {
        await this.fillField(this.cardholderNameSelector, name);
      }
    }
  }

  /**
   * Submit payment
   */
  async confirmPayment(): Promise<void> {
    await this.clickElement(this.paymentButtonSelector);
    
    // Wait for payment processing to complete
    await this.waitForNavigation(/.*\/(booking\/confirmation|payment\/confirmation)/);
  }

  /**
   * Get payment error
   */
  async getPaymentError(): Promise<string | null> {
    if (await this.isElementVisible(this.paymentErrorSelector)) {
      return await this.getElementText(this.paymentErrorSelector);
    }
    return null;
  }

  /**
   * Check if payment was successful
   */
  async isPaymentSuccessful(): Promise<boolean> {
    return await this.isElementVisible(this.paymentSuccessSelector);
  }

  /**
   * Get payment amount
   */
  async getPaymentAmount(): Promise<string | null> {
    return await this.getElementText(this.priceSelector);
  }

  /**
   * Get booking summary details
   */
  async getBookingSummary(): Promise<{
    sessionType: string | null;
    date: string | null;
    time: string | null;
    price: string | null;
  }> {
    const summary = this.page.locator(this.bookingSummarySelector);
    
    return {
      sessionType: await this.getElementText(`${this.bookingSummarySelector} [data-testid="session-type"]`),
      date: await this.getElementText(`${this.bookingSummarySelector} [data-testid="booking-date"]`),
      time: await this.getElementText(`${this.bookingSummarySelector} [data-testid="booking-time"]`),
      price: await this.getElementText(this.priceSelector),
    };
  }
}

export class BookingConfirmationPage extends BasePage {
  // Selectors
  private confirmationMessageSelector = '[data-testid="confirmation-message"]';
  private bookingDetailsSelector = '[data-testid="booking-details"]';
  private paymentStatusSelector = '[data-testid="payment-status"]';
  private calendarButtonSelector = '[data-testid="add-to-calendar"]';
  private dashboardButtonSelector = '[data-testid="go-to-dashboard"]';
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to booking confirmation page
   */
  async navigateToConfirmation(bookingId: string): Promise<void> {
    await this.navigateTo(`/booking/confirmation?bookingId=${bookingId}`);
  }

  /**
   * Check if booking is confirmed
   */
  async isBookingConfirmed(): Promise<boolean> {
    const message = await this.getElementText(this.confirmationMessageSelector);
    return message !== null && message.toLowerCase().includes('confirmed');
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(): Promise<string | null> {
    return await this.getElementText(this.paymentStatusSelector);
  }

  /**
   * Click add to calendar button
   */
  async addToCalendar(): Promise<void> {
    await this.clickElement(this.calendarButtonSelector);
  }

  /**
   * Go to dashboard
   */
  async goToDashboard(): Promise<void> {
    await this.clickElement(this.dashboardButtonSelector);
    await this.waitForNavigation(/.*\/dashboard/);
  }

  /**
   * Get booking details from confirmation page
   */
  async getBookingDetails(): Promise<{
    sessionType: string | null;
    date: string | null;
    time: string | null;
    builder: string | null;
    status: string | null;
    paymentStatus: string | null;
  }> {
    return {
      sessionType: await this.getElementText('[data-testid="session-type"]'),
      date: await this.getElementText('[data-testid="booking-date"]'),
      time: await this.getElementText('[data-testid="booking-time"]'),
      builder: await this.getElementText('[data-testid="builder-name"]'),
      status: await this.getElementText('[data-testid="booking-status"]'),
      paymentStatus: await this.getElementText(this.paymentStatusSelector),
    };
  }
}