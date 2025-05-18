# Calendly-Stripe Integration: Booking Flow State Machine

## State Machine Overview

This document defines the comprehensive state machine for the Calendly-to-Stripe booking flow integration. It outlines all possible states, transitions, triggers, and error handling scenarios for the end-to-end booking process.

```
┌────────────────┐       ┌─────────────────────┐      ┌────────────────────┐
│                │       │                     │      │                    │
│     IDLE       ├──────►│ SESSION_TYPE_SELECT ├─────►│ CALENDLY_SCHEDULING│
│                │       │                     │      │                    │
└────────────────┘       └─────────────────────┘      └──────────┬─────────┘
                                                                  │
                                                                  ▼
┌────────────────┐       ┌─────────────────────┐      ┌────────────────────┐
│                │       │                     │      │                    │
│ PAYMENT_FAILED │◄──────┤  PAYMENT_PROCESSING │◄─────┤ CALENDLY_SCHEDULED │
│                │       │                     │      │                    │
└────────┬───────┘       └─────────────────────┘      └────────────────────┘
         │                         │                            ▲
         │                         │                            │
         │                         ▼                            │
┌────────▼───────┐       ┌─────────────────────┐      ┌────────┴───────────┐
│                │       │                     │      │                    │
│ERROR_RECOVERY  │       │  PAYMENT_SUCCEEDED  │─────►│ BOOKING_CONFIRMED  │
│                │       │                     │      │                    │
└────────────────┘       └─────────────────────┘      └────────┬───────────┘
                                                               │
                                                               │
                                                               ▼
                         ┌─────────────────────┐      ┌────────────────────┐
                         │                     │      │                    │
                         │  REFUND_COMPLETED   │◄─────┤  BOOKING_CANCELLED │
                         │                     │      │                    │
                         └─────────────────────┘      └────────────────────┘
```

## State Definitions

### Initial States

1. **IDLE**
   - Description: Starting state before any booking action
   - Properties: None
   - Valid transitions: SESSION_TYPE_SELECTION
   - Persistence: None

2. **SESSION_TYPE_SELECTION**
   - Description: User is selecting a session type
   - Properties: 
     - availableSessionTypes: Array of SessionType
     - selectedFilters: Object
   - Valid transitions: CALENDLY_SCHEDULING, IDLE
   - Persistence: SessionStorage

### Calendly-Specific States

3. **CALENDLY_SCHEDULING**
   - Description: User is interacting with Calendly embed
   - Properties: 
     - sessionTypeId: string
     - calendlyLink: string
     - clientInfo: ClientInfo
   - Valid transitions: CALENDLY_SCHEDULED, ERROR_CALENDLY, IDLE
   - Persistence: SessionStorage

4. **CALENDLY_SCHEDULED**
   - Description: Booking created in Calendly, awaiting webhook confirmation
   - Properties:
     - calendlyEventUri: string
     - scheduledTime: ISO8601 string
     - inviteeInfo: InviteeInfo
     - tempBookingId: string
   - Valid transitions: PAYMENT_PENDING, CALENDLY_WEBHOOK_RECEIVED, ERROR_WEBHOOK
   - Persistence: SessionStorage + Database (pending)

5. **CALENDLY_WEBHOOK_RECEIVED**
   - Description: Webhook received from Calendly, processing booking
   - Properties:
     - webhookEventType: string
     - calendlyEventData: CalendlyEventData
     - bookingId: string
   - Valid transitions: PAYMENT_PENDING, BOOKING_CANCELLED, ERROR_WEBHOOK
   - Persistence: Database

### Payment States

6. **PAYMENT_PENDING**
   - Description: Redirecting to Stripe checkout
   - Properties:
     - bookingId: string
     - stripeSessionId: string
     - amount: number
     - currency: string
     - returnUrl: string
   - Valid transitions: PAYMENT_PROCESSING, ERROR_PAYMENT
   - Persistence: Database + SessionStorage

7. **PAYMENT_PROCESSING**
   - Description: Payment is being processed by Stripe
   - Properties:
     - stripeSessionId: string
     - stripePaymentIntentId: string
     - paymentMethod: string
   - Valid transitions: PAYMENT_SUCCEEDED, PAYMENT_FAILED
   - Persistence: Database

8. **PAYMENT_SUCCEEDED**
   - Description: Payment completed successfully
   - Properties:
     - stripeSessionId: string
     - stripePaymentIntentId: string
     - receiptUrl: string
     - paymentTimestamp: ISO8601 string
   - Valid transitions: BOOKING_CONFIRMED
   - Persistence: Database

9. **PAYMENT_FAILED**
   - Description: Payment failed
   - Properties:
     - stripeSessionId: string
     - stripePaymentIntentId: string
     - errorCode: string
     - errorMessage: string
     - failureTimestamp: ISO8601 string
   - Valid transitions: PAYMENT_PENDING, ERROR_RECOVERY
   - Persistence: Database

### Booking Management States

10. **BOOKING_CONFIRMED**
    - Description: Booking and payment confirmed
    - Properties:
      - bookingId: string
      - calendlyEventUri: string
      - stripePaymentIntentId: string
      - confirmationTimestamp: ISO8601 string
      - sessionDetails: SessionDetails
    - Valid transitions: BOOKING_CANCELLED, BOOKING_RESCHEDULED
    - Persistence: Database

11. **BOOKING_CANCELLED**
    - Description: Booking has been cancelled
    - Properties:
      - bookingId: string
      - cancellationReason: string
      - cancellationTimestamp: ISO8601 string
      - cancelledBy: string
    - Valid transitions: REFUND_PENDING, BOOKING_CONFIRMED (if cancellation is reversed)
    - Persistence: Database

12. **BOOKING_RESCHEDULED**
    - Description: Booking has been rescheduled
    - Properties:
      - bookingId: string
      - oldScheduledTime: ISO8601 string
      - newScheduledTime: ISO8601 string
      - rescheduledTimestamp: ISO8601 string
      - rescheduledBy: string
    - Valid transitions: BOOKING_CONFIRMED, BOOKING_CANCELLED
    - Persistence: Database

13. **REFUND_PENDING**
    - Description: Refund is being processed
    - Properties:
      - bookingId: string
      - stripeRefundId: string
      - refundAmount: number
      - refundReason: string
      - refundTimestamp: ISO8601 string
    - Valid transitions: REFUND_COMPLETED, ERROR_PAYMENT
    - Persistence: Database

14. **REFUND_COMPLETED**
    - Description: Refund has been completed
    - Properties:
      - bookingId: string
      - stripeRefundId: string
      - refundReceiptUrl: string
      - completionTimestamp: ISO8601 string
    - Valid transitions: None (terminal state)
    - Persistence: Database

### Error States

15. **ERROR_CALENDLY**
    - Description: Error occurred during Calendly scheduling
    - Properties:
      - errorCode: string
      - errorMessage: string
      - errorTimestamp: ISO8601 string
      - recoverable: boolean
    - Valid transitions: CALENDLY_SCHEDULING, IDLE, ERROR_RECOVERY
    - Persistence: SessionStorage + Logs

16. **ERROR_PAYMENT**
    - Description: Error during payment processing
    - Properties:
      - bookingId: string
      - stripeErrorCode: string
      - stripeErrorMessage: string
      - errorTimestamp: ISO8601 string
      - recoverable: boolean
    - Valid transitions: PAYMENT_PENDING, ERROR_RECOVERY
    - Persistence: Database + Logs

17. **ERROR_WEBHOOK**
    - Description: Error in webhook processing
    - Properties:
      - webhookId: string
      - errorCode: string
      - errorMessage: string
      - errorTimestamp: ISO8601 string
      - webhookPayload: object
      - recoverable: boolean
    - Valid transitions: CALENDLY_SCHEDULED, ERROR_RECOVERY
    - Persistence: Database + Logs

18. **ERROR_RECOVERY**
    - Description: Attempting to recover from error
    - Properties:
      - originalState: string
      - originalErrorCode: string
      - recoveryAttempt: number
      - recoveryTimestamp: ISO8601 string
    - Valid transitions: Any valid state depending on recovery action
    - Persistence: Database + Logs

## Transition Triggers

### User-Initiated Triggers

1. **selectSessionType**
   - From: IDLE
   - To: SESSION_TYPE_SELECTION
   - Description: User begins the booking process

2. **startCalendlyScheduling**
   - From: SESSION_TYPE_SELECTION
   - To: CALENDLY_SCHEDULING
   - Description: User selects a session type and initiates Calendly scheduling

3. **cancelBookingProcess**
   - From: Any state before BOOKING_CONFIRMED
   - To: IDLE
   - Description: User cancels the booking process

4. **cancelBooking**
   - From: BOOKING_CONFIRMED
   - To: BOOKING_CANCELLED
   - Description: User cancels a confirmed booking

5. **rescheduleBooking**
   - From: BOOKING_CONFIRMED
   - To: BOOKING_RESCHEDULED
   - Description: User reschedules a confirmed booking

6. **retryPayment**
   - From: PAYMENT_FAILED
   - To: PAYMENT_PENDING
   - Description: User retries a failed payment

### System-Initiated Triggers

7. **onCalendlyEventCreated**
   - From: CALENDLY_SCHEDULING
   - To: CALENDLY_SCHEDULED
   - Description: Calendly event is created

8. **onCalendlyWebhookReceived**
   - From: CALENDLY_SCHEDULED
   - To: CALENDLY_WEBHOOK_RECEIVED
   - Description: Webhook is received from Calendly

9. **initiatePayment**
   - From: CALENDLY_WEBHOOK_RECEIVED
   - To: PAYMENT_PENDING
   - Description: System initiates payment process after booking

10. **onStripeSessionCreated**
    - From: PAYMENT_PENDING
    - To: PAYMENT_PROCESSING
    - Description: Stripe checkout session is created and user is redirected

11. **onPaymentSucceeded**
    - From: PAYMENT_PROCESSING
    - To: PAYMENT_SUCCEEDED
    - Description: Payment is successful

12. **onPaymentFailed**
    - From: PAYMENT_PROCESSING
    - To: PAYMENT_FAILED
    - Description: Payment fails

13. **confirmBooking**
    - From: PAYMENT_SUCCEEDED
    - To: BOOKING_CONFIRMED
    - Description: System confirms booking after successful payment

14. **initiateRefund**
    - From: BOOKING_CANCELLED
    - To: REFUND_PENDING
    - Description: System initiates refund process for cancelled booking

15. **completeRefund**
    - From: REFUND_PENDING
    - To: REFUND_COMPLETED
    - Description: Refund is completed

### Error Handling Triggers

16. **onCalendlyError**
    - From: CALENDLY_SCHEDULING
    - To: ERROR_CALENDLY
    - Description: Error occurs during Calendly scheduling

17. **onPaymentError**
    - From: PAYMENT_PENDING, PAYMENT_PROCESSING, REFUND_PENDING
    - To: ERROR_PAYMENT
    - Description: Error occurs during payment or refund processing

18. **onWebhookError**
    - From: CALENDLY_SCHEDULED, CALENDLY_WEBHOOK_RECEIVED
    - To: ERROR_WEBHOOK
    - Description: Error occurs during webhook processing

19. **attemptRecovery**
    - From: ERROR_CALENDLY, ERROR_PAYMENT, ERROR_WEBHOOK
    - To: ERROR_RECOVERY
    - Description: System attempts to recover from error

20. **recoverySucceeded**
    - From: ERROR_RECOVERY
    - To: [Original state before error]
    - Description: Recovery is successful

21. **recoveryFailed**
    - From: ERROR_RECOVERY
    - To: [Appropriate error state]
    - Description: Recovery fails

## Edge Cases and Special Conditions

### Webhook Race Conditions

1. **Early Webhook Arrival**
   - Scenario: Webhook arrives before client-side booking confirmation
   - Handling: Store webhook data with pending status, associate with user session when client confirms

2. **Missing Webhook**
   - Scenario: Webhook never arrives for a Calendly booking
   - Handling: Client-side polling with timeout, then graceful fallback to manual confirmation

### Payment Interruptions

3. **Browser Closed During Payment**
   - Scenario: User closes browser during Stripe redirect
   - Handling: State persistence enables recovery when user returns, with recovery link in email

4. **Payment Session Expiry**
   - Scenario: Stripe session expires before payment completion
   - Handling: Detect expiry, offer session refresh without losing booking data

### Cancellation and Refund Scenarios

5. **Cancellation After Payment**
   - Scenario: Booking cancelled after successful payment
   - Handling: Automatic refund process with confirmation

6. **Partial Refund Requirements**
   - Scenario: Business rules require partial refund
   - Handling: Support partial refund amounts based on cancellation timing

### Rescheduling Complexities

7. **Rescheduling with Price Difference**
   - Scenario: Rescheduled session has different price
   - Handling: Support additional payment or partial refund based on price difference

8. **Calendly-Initiated Reschedule**
   - Scenario: Builder reschedules via Calendly directly
   - Handling: Webhook captures change, notification sent to client

### Security and Compliance

9. **Webhook Replay Attack**
   - Scenario: Malicious replay of webhook payloads
   - Handling: Webhook signing and idempotency checks

10. **Payment Data Security**
    - Scenario: Need to avoid storing sensitive payment data
    - Handling: Use Stripe references only, no card data stored

## State Persistence Strategy

### Client-Side Storage
- SessionStorage for active booking flow state
- LocalStorage for recovery identifiers only
- Clear sensitive data when appropriate states are reached

### Server-Side Storage
- Database for all confirmed booking information
- Redis/cache for temporary webhook data and session mapping
- Encrypted storage for sensitive booking details

### Recovery Mechanisms
- Session identifiers to reconnect client sessions after interruptions
- Recovery links in booking confirmation emails
- Timeout-based cleanup for abandoned booking flows

## Implementation Guidelines

1. Use React Context + useReducer for client-side state management
2. Implement server-side state transitions as explicit functions
3. Log all state transitions for debugging and audit
4. Implement comprehensive error handling with user-friendly messages
5. Support explicit timeouts for each state to prevent stuck bookings
6. Design UI components to adapt to each possible state