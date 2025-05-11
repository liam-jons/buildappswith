# Calendly-Stripe Integration Guide

This document provides an overview of how the Calendly scheduling system integrates with the Stripe payment system in the BuildAppsWith platform.

## Architecture Overview

The integration follows this general flow:

```
Calendly Booking → Booking Confirmation → Stripe Checkout → Payment Confirmation
```

1. **Calendly Booking**: Users select a session type and book a time slot through the Calendly widget.
2. **Booking Confirmation**: After booking, users are redirected to our booking confirmation page, which shows booking details.
3. **Stripe Checkout**: Users click "Proceed to Payment" to be redirected to the Stripe Checkout page.
4. **Payment Confirmation**: After payment, users are redirected back to the booking confirmation page with payment status.

## Implementation Details

### Component Architecture

- **Checkout Button**: The `CheckoutButton` component initiates the checkout process and redirects to Stripe.
- **Booking Confirmation**: The `BookingConfirmation` component shows booking details and allows proceeding to payment.
- **Payment Confirmation**: The `PaymentConfirmation` component shows the payment status after checkout.

### API Routes

- **POST /api/stripe/checkout**: Creates a Stripe checkout session for a booking.
- **GET /api/stripe/sessions/[id]**: Gets details of a Stripe checkout session.
- **POST /api/webhooks/stripe**: Receives and processes Stripe webhook events.
- **POST /api/webhooks/calendly**: Receives and processes Calendly webhook events.

### Server Actions

- **createCheckoutSession**: Creates a Stripe checkout session for a booking.
- **handleSuccessfulPayment**: Updates booking status after successful payment.
- **getCheckoutSessionStatus**: Gets the status of a checkout session.

### Data Flow

#### Creating a New Booking from Calendly

1. User books through Calendly widget
2. Calendly webhook creates a booking record (if configured)
3. User is redirected to booking confirmation page
4. User clicks "Proceed to Payment"
5. System checks if booking exists:
   - If exists: Uses existing booking ID
   - If not: Creates new booking from Calendly data
6. Stripe checkout session is created with booking ID and Calendly event ID
7. User completes payment on Stripe
8. Stripe webhook updates booking status to CONFIRMED and payment status to PAID

#### Using an Existing Booking

1. Booking already exists in database
2. User is redirected to booking confirmation page
3. User clicks "Proceed to Payment"
4. Stripe checkout session is created with booking ID
5. User completes payment on Stripe
6. Stripe webhook updates booking status and payment status

## Handling Three Booking Scenarios

The integration handles three distinct scenarios:

1. **Existing booking with ID**: For bookings already in our database.
2. **Calendly booking without booking ID**: For bookings initiated through Calendly before our system has created a record.
3. **New booking (non-Calendly)**: For bookings created directly through our system (not currently implemented).

## Metadata and Tracking

The integration includes comprehensive metadata to track the booking through the payment process:

- **Stripe Checkout Metadata**:
  - `bookingId`: ID of the booking in our system
  - `builderId`: ID of the builder
  - `clientId`: ID of the client
  - `sessionTypeId`: ID of the session type
  - `startTime`: Start time of the booking
  - `endTime`: End time of the booking
  - `timezone`: Client's timezone
  - `calendlyEventId`: ID of the Calendly event (if applicable)
  - `isCalendlyBooking`: Whether the booking was initiated through Calendly

## Analytics Events

The following analytics events track the booking-payment flow:

- `BOOKING_CREATED`: When a booking is created
- `CHECKOUT_INITIATED`: When checkout process begins
- `CHECKOUT_SESSION_CREATED`: When Stripe checkout session is created
- `CHECKOUT_COMPLETED`: When checkout is completed successfully
- `PAYMENT_COMPLETED`: When payment is processed successfully
- `PAYMENT_FAILED`: When payment fails
- `CHECKOUT_EXPIRED`: When checkout session expires

## Error Handling

The integration handles various error cases:

- Authentication errors: User not signed in
- Authorization errors: User not authorized for booking
- Not found errors: Booking or session type not found
- Payment processing errors: Issues with Stripe
- Database errors: Issues with booking creation/update

## Webhook Security

Both Calendly and Stripe webhooks are secured:

- Stripe uses webhook signatures to verify authenticity
- Calendly uses webhook signing keys
- All webhook endpoints use proper security middleware

## Testing

Comprehensive tests cover the integration:

- Unit tests for each component and server action
- Integration tests for the full flow
- Error case testing
- Mock services for testing without external dependencies

## Future Improvements

Potential improvements for future iterations:

1. Implementing refund handling
2. Supporting subscription payments
3. Enhanced analytics integration
4. Session cancellation policies
5. Automated reminders and follow-ups
6. Support for discounts and promo codes

## Implementation Timeline

1. ✅ Server actions for Stripe integration with Calendly
2. ✅ Checkout API route with Calendly support
3. ✅ Stripe webhook handler for payment events
4. ✅ Client components for booking confirmation
5. ✅ Analytics tracking for the complete flow