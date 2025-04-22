# Stripe Integration Troubleshooting

This document provides solutions for common issues with the Stripe integration in the Buildappswith platform.

## Error: "Neither apiKey nor config.authenticator provided"

### Description

This error occurs when the Stripe client cannot be initialized because the API key is missing. The error typically appears during build or deployment and looks like:

```
Error: Neither apiKey nor config.authenticator provided
 at r._setAuthenticator (.next/server/chunks/1376.js:1:82630)
 at new r (.next/server/chunks/1376.js:1:77427)
 at 56649 (.next/server/app/api/checkout/session/route.js:1:3254)
```

### Causes

1. **Missing Environment Variable**: The `STRIPE_SECRET_KEY` environment variable is not set in your deployment environment.
2. **Environment Variable Loading Issue**: The environment variable exists but is not being properly loaded during build.
3. **Conditional Initialization**: The Stripe client is being initialized without checking if the key exists.

### Solutions

#### 1. Add Missing Environment Variable

Ensure that the `STRIPE_SECRET_KEY` is properly set in your deployment environment:

- **For Vercel**:
  1. Go to your project settings in the Vercel dashboard
  2. Navigate to the Environment Variables section
  3. Add or update the `STRIPE_SECRET_KEY` variable
  4. Redeploy your application

- **For Local Development**:
  1. Check your `.env.local` file to ensure it contains:
     ```
     STRIPE_SECRET_KEY=sk_test_your_test_key
     ```
  2. Restart your development server

#### 2. Modify Stripe Client Initialization

Update the Stripe client initialization in `/lib/stripe/stripe-server.ts` to handle missing API keys more gracefully:

```typescript
// Initialize Stripe with proper typing and error handling
let stripe: Stripe | null = null;

// Only initialize if API key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil' as const,
  });
} else {
  console.warn('Warning: STRIPE_SECRET_KEY not provided. Stripe functionality will be disabled.');
}

// Export the typed instance
export { stripe };

// Create a helper to check if Stripe is initialized
export function isStripeInitialized(): boolean {
  return !!stripe;
}
```

Then update your API routes to check if Stripe is initialized before using it:

```typescript
import { stripe, isStripeInitialized } from "@/lib/stripe/stripe-server";

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is initialized
    if (!isStripeInitialized()) {
      return NextResponse.json(
        { error: "Stripe integration is not configured" },
        { status: 503 }
      );
    }
    
    // Rest of your code...
  } catch (error) {
    // Error handling...
  }
}
```

#### 3. Add Build-Time Conditional Checks

Modify your Next.js configuration to conditionally skip Stripe-related routes during build if the API key is missing:

```javascript
// next.config.mjs
const nextConfig = {
  // Conditionally exclude Stripe routes during build if API key is missing
  experimental: {
    instrumentationHook: true,
    outputFileTracingExcludes: !process.env.STRIPE_SECRET_KEY 
      ? { '*': ['app/api/checkout/**'] } 
      : {},
  },
};
```

### Verification Steps

After implementing a solution:

1. Verify that the environment variable is set:
   ```bash
   # For local development
   echo $STRIPE_SECRET_KEY
   
   # For Vercel deployments, check the environment variables in the dashboard
   ```

2. Run a build to verify the fix:
   ```bash
   pnpm run build
   ```

3. Test the Stripe integration by creating a checkout session.

## Additional Stripe Troubleshooting

### Webhook Errors

If you're experiencing issues with Stripe webhooks:

1. **Check Webhook Configuration**:
   - Verify the webhook endpoint is correctly set in the Stripe dashboard
   - Ensure the webhook secret is properly set in your environment variables

2. **Test Webhook Locally**:
   - Use the Stripe CLI to forward webhooks to your local development environment:
     ```bash
     stripe listen --forward-to http://localhost:3000/api/stripe/webhook
     ```

### Payment Flow Issues

If payments are not processing correctly:

1. **Check Checkout Session Creation**:
   - Verify that the checkout session is being created with the correct parameters
   - Check browser developer tools for any client-side errors

2. **Verify Success/Cancel URLs**:
   - Ensure that success and cancel URLs are correctly configured
   - Test the complete payment flow with Stripe test cards

### API Version Compatibility

If you're seeing Stripe API compatibility errors:

1. **Check API Version**:
   - Verify that the API version specified in the Stripe client initialization matches the features you're using
   - Current version in the codebase: `2025-03-31.basil`

2. **Update Dependencies**:
   - Ensure you're using the latest version of the Stripe SDK:
     ```bash
     pnpm add stripe@latest
     ```

## Stripe Integration Best Practices

1. **Use Environment Variables**:
   - Never hardcode API keys
   - Use different keys for development and production

2. **Implement Proper Error Handling**:
   - Always handle potential Stripe API errors
   - Provide user-friendly error messages

3. **Test Extensively**:
   - Use Stripe's test mode and test cards
   - Test all payment flows and webhook events

4. **Monitor Stripe Events**:
   - Implement logging for Stripe webhook events
   - Set up monitoring for payment failures
