# Stripe Payment Integration Documentation

## Overview

The Stripe payment integration handles all financial transactions on the platform, including session bookings, builder payouts, and payment processing. This feature supports the booking functionality specified in PRD 2.0.

## Integration Components

### 1. Stripe Setup

- **Environment Variables**:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- **Products**: Each session type is configured as a Stripe Product
- **Prices**: Dynamic pricing based on session configuration
- **Webhooks**: Event handling for payment status updates

### 2. Payment Flow

#### Session Booking Process
1. Client selects session type and time slot
2. System creates Stripe Checkout Session
3. Client redirected to Stripe payment page
4. Payment processed by Stripe
5. System receives webhook confirmation
6. Booking confirmed and calendar updated

#### Success/Cancellation Handling
- **Success Page**: `/payment/success` with booking confirmation
- **Cancel Page**: `/payment/cancel` with option to retry
- **Error Handling**: Graceful failure messaging

### 3. Webhook Events

Handled events:
- `checkout.session.completed`: Booking confirmation
- `payment_intent.succeeded`: Payment received
- `payment_intent.payment_failed`: Payment failure
- `charge.refunded`: Refund processing

### 4. Database Integration

#### Booking Record
```typescript
interface Booking {
  id: string;
  clientId: string;
  builderId: string;
  sessionTypeId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId: string;
  checkoutSessionId: string;
}
```

### 5. API Endpoints

- `POST /api/payments/create-checkout-session`
  - Creates Stripe Checkout Session
  - Validates session availability
  - Reserves time slot

- `POST /api/payments/webhook`
  - Handles Stripe webhook events
  - Updates booking status
  - Triggers notifications

## Security Considerations

1. **API Key Protection**: Secrets stored securely in environment
2. **Webhook Verification**: Signatures validated for authenticity
3. **Data Encryption**: Sensitive payment data never stored
4. **Error Logging**: Detailed logging without exposing secrets

## Implementation Details

### Creating a Checkout Session
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'gbp',
      product_data: {
        name: sessionType.name,
        description: sessionType.description,
      },
      unit_amount: sessionType.price * 100,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,
  metadata: {
    bookingId: booking.id,
    builderId: booking.builderId,
    clientId: booking.clientId,
  },
});
```

### Webhook Handler
```typescript
async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await confirmBooking(session.metadata.bookingId);
      break;
    // Handle other event types...
  }
}
```

## Error Handling

1. **Payment Failures**: Client notified and booking released
2. **Webhook Failures**: Automatic retries with exponential backoff
3. **Database Errors**: Transaction rollback with cleanup
4. **API Errors**: Graceful degradation with user messaging

## Testing

### Test Cards
- Success: `4242 4242 4242 4242`
- Failure: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### Webhook Testing
1. Use Stripe CLI for local testing
2. Configure test endpoint URL
3. Monitor webhook events in Stripe Dashboard

## Maintenance

1. **Regular Tasks**:
   - Monitor failed payments
   - Review webhook logs
   - Update pricing as needed
   - Reconcile transactions

2. **Version Updates**:
   - Keep Stripe SDK updated
   - Test new API versions before upgrading
   - Document breaking changes

## Troubleshooting

Common issues and solutions:
1. **Payment Declined**: Check card details and try again
2. **Webhook Failure**: Verify webhook secret and URL
3. **Session Expired**: Implement session refresh logic
4. **Double Booking**: Add database constraints

## Future Enhancements

1. **Subscription Support**: Recurring session packages
2. **Split Payments**: Platform fee separation
3. **Multi-Currency**: Support for international clients
4. **Payment Methods**: Add PayPal, Apple Pay
5. **Automated Refunds**: Self-service refund requests
