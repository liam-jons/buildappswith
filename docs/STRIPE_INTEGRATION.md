# Stripe Integration for Buildappswith

*Version: 1.0.110*

This document provides information on setting up and testing the Stripe integration for the Buildappswith platform.

## Configuration

The Stripe integration requires the following environment variables to be set:

```
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

These variables are already configured in the `.env.local` file for development.

## Testing the Integration

### Local Development Testing

1. To test the Stripe integration locally, you can use the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

2. The CLI will provide a webhook secret that you should set in your `.env.local` file.

3. You can simulate a checkout session completion using:

```bash
stripe trigger checkout.session.completed
```

### User Flow Testing

1. Visit the marketplace page to see the list of builders
2. Click on Liam Jones's profile (or any other builder)
3. Click on "Book a Session" 
4. Select a session type (e.g., "Individuals - 1-to-1")
5. Select a date and time
6. Click through to the payment screen
7. Complete payment using test card information:
   - Card number: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Postal code: Any 5 digits

## Production Considerations

Before deploying to production:

1. Replace test API keys with live keys in the production environment
2. Set up proper webhook endpoints in the Stripe dashboard
3. Update the webhook secret in the production environment variables

## Troubleshooting

If you encounter issues with the Stripe integration:

1. Check the browser console for client-side errors
2. Check server logs for API errors
3. Verify that environment variables are correctly set
4. Ensure the webhook secret matches what's shown in the Stripe dashboard

For more information on Stripe integration, see the [Stripe API documentation](https://stripe.com/docs/api).
