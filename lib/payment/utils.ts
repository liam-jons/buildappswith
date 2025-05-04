/**
 * Utility functions for payment processing
 */

import { PaymentStatus } from "./types";

/**
 * Formats a currency amount with the appropriate symbol
 * 
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates tax based on location and amount
 * 
 * @param amount The base amount
 * @param countryCode The country code for tax calculation
 * @param regionCode Optional region/state code for more specific tax calculation
 * @returns The calculated tax amount
 */
export function calculateTax(
  amount: number,
  countryCode: string,
  regionCode?: string
): number {
  // This is a simplified implementation - in a real application,
  // this would connect to a tax calculation service or database
  // of tax rates by region
  
  // Default tax rate
  let taxRate = 0;
  
  // Sample tax rates by country
  switch (countryCode.toUpperCase()) {
    case "US":
      // US has state-specific tax rates
      if (regionCode) {
        switch (regionCode.toUpperCase()) {
          case "CA":
            taxRate = 0.0725; // California base rate
            break;
          case "NY":
            taxRate = 0.04; // New York base rate
            break;
          case "TX":
            taxRate = 0.0625; // Texas base rate
            break;
          default:
            taxRate = 0.05; // Default US tax rate
        }
      } else {
        taxRate = 0.05; // Default US tax rate
      }
      break;
    case "GB":
      taxRate = 0.2; // UK VAT
      break;
    case "DE":
      taxRate = 0.19; // Germany VAT
      break;
    case "FR":
      taxRate = 0.2; // France VAT
      break;
    case "CA":
      taxRate = 0.05; // Canada GST (simplified)
      break;
    default:
      taxRate = 0; // No tax for other countries
  }
  
  // Calculate tax amount (rounded to 2 decimal places)
  return Math.round(amount * taxRate * 100) / 100;
}

/**
 * Calculates the expiration time for a checkout session
 * 
 * @param durationMinutes Number of minutes until expiration (default: 30)
 * @returns Timestamp for session expiration
 */
export function calculateSessionExpiry(durationMinutes: number = 30): number {
  return Math.floor(Date.now() / 1000) + durationMinutes * 60;
}

/**
 * Maps a Stripe payment status to our internal PaymentStatus enum
 * 
 * @param stripeStatus The status from Stripe
 * @returns Our internal PaymentStatus
 */
export function mapStripePaymentStatus(stripeStatus: string): PaymentStatus {
  switch (stripeStatus) {
    case "unpaid":
      return PaymentStatus.UNPAID;
    case "paid":
      return PaymentStatus.PAID;
    case "canceled":
      return PaymentStatus.CANCELED;
    case "failed":
      return PaymentStatus.FAILED;
    default:
      return PaymentStatus.PENDING;
  }
}

/**
 * Determines if a payment status is considered final (i.e., no more changes expected)
 * 
 * @param status The payment status to check
 * @returns Whether the status is final
 */
export function isPaymentStatusFinal(status: PaymentStatus): boolean {
  return [
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELED,
    PaymentStatus.REFUNDED,
    PaymentStatus.PARTIALLY_REFUNDED,
  ].includes(status);
}

/**
 * Generates an idempotency key for Stripe requests
 * 
 * @param prefix Optional prefix for the key
 * @returns Unique idempotency key
 */
export function generateIdempotencyKey(prefix?: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix || "payment"}_${timestamp}_${random}`;
}

/**
 * Creates a payment description based on the session type and booking details
 * 
 * @param sessionType Name of the session type
 * @param bookingInfo Additional booking information
 * @returns Formatted payment description
 */
export function createPaymentDescription(
  sessionType: string,
  bookingInfo?: { date?: string; time?: string; duration?: number }
): string {
  let description = `Payment for ${sessionType} session`;
  
  if (bookingInfo) {
    const { date, time, duration } = bookingInfo;
    
    if (date) {
      description += ` on ${date}`;
    }
    
    if (time) {
      description += ` at ${time}`;
    }
    
    if (duration) {
      description += ` (${duration} minutes)`;
    }
  }
  
  return description;
}
