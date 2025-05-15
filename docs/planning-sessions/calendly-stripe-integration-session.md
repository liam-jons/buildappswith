# Session Context

- Session Type: Implementation (Critical Integration)
- Component Focus: Calendly Booking Integration → Stripe Payment Flow
- Current Branch: feature/calendly-integration-finalisation
- Related Documentation: docs/infrastructure/scheduling/, docs/implementation-plans/CALENDLY_STRIPE_IMPLEMENTATION_PLAN.md,
  docs/testing/CALENDLY_CRITICAL_PATH_TEST.md, docs/testing/CALENDLY_MANUAL_TESTING_PLAN.md
- Linear Project: BOOKING-PAYMENT-INTEGRATION
- Ticket References: Complete booking flow from marketplace to payment
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Component Background

This critical session addresses the integration between Calendly booking and Stripe payment processing, 
enabling the complete user journey from marketplace browsing to successful session booking. Currently, 
users can navigate through the marketplace and reach the booking page but encounter a perpetual loading 
screen when attempting to schedule.

The integration must connect three key systems:
1. Marketplace builder profiles (currently showing 6 profiles, only Liam's is real)
2. Calendly embedded scheduling (needs to work initially only for Liam's profile)
3. Stripe payment processing (requires API key configuration)

This is a critical flow that directly impacts revenue generation and user experience. The implementation 
must be production-ready for Liam's profile while gracefully handling dummy profiles.

## Implementation Objectives

- Configure Calendly embed to display Liam's availability on booking page
- Implement proper authentication flow for Calendly OAuth or API key
- Ensure seamless transition from marketplace → profile → booking → Calendly embed
- Configure Stripe integration for payment after Calendly scheduling
- Handle loading states and error conditions throughout the flow
- Implement proper error boundaries for integration failures
- Create fallback UI for dummy profiles (non-booking message)
- Establish webhook handling for booking confirmations
- Test complete flow from marketplace to payment confirmation
- Document API configuration and deployment requirements

## Technical Specifications

### Calendly Integration Requirements
- Calendly account setup with proper event types
- API key or OAuth token configuration
- Event type ID for session bookings
- Webhook URL for booking notifications
- CORS configuration for embed
- Session duration and pricing parameters

### Stripe Integration Requirements
- Stripe API keys (publishable and secret)
- Product/Price IDs for session types
- Webhook endpoints for payment status
- Payment intent creation logic
- Success/Cancel redirect URLs
- Customer creation and management

### Database Schema Requirements
- User profile with calendlyEventUrl field
- Session types with duration and pricing
- Booking records with status tracking
- Payment records linked to bookings
- Webhook event logging

## Available Reference Material

- components/scheduling/calendly/ - Calendly integration components
- components/scheduling/client/integrated-booking.tsx - Booking flow component
- components/payment/ - Stripe payment components
- app/api/scheduling/ - Booking API endpoints
- app/api/stripe/ - Payment API endpoints
- app/(platform)/marketplace/builders/[id]/page.tsx - Builder profile page
- app/(platform)/book/[builderId]/page.tsx - Booking page
- lib/scheduling/ - Calendly utilities
- lib/stripe/ - Stripe configuration
- prisma/schema.prisma - Database schema

## Expected Outputs

- Working Calendly embed on Liam's booking page
- Configured API keys in environment variables
- Stripe checkout flow after Calendly selection
- Webhook handlers for booking/payment events
- Error handling for failed integrations
- Loading states for async operations
- Dummy profile fallback messaging
- Complete flow testing documentation
- Production deployment checklist
- Integration troubleshooting guide
- Performance optimization notes
- Security best practices implementation

## Research Focus Areas

- Current Calendly component implementation status
- Existing Stripe configuration and utilities
- Database fields for integration URLs/IDs
- Environment variable requirements
- CORS and CSP considerations for embeds
- Webhook security and verification
- Error recovery patterns
- Loading state management
- User feedback during async operations
- Integration testing strategies
- Production monitoring setup
- Fallback behavior for failures

## Current Issue Details

### Perpetual Loading Screen
- Booking page shows continuous loading spinner
- No Calendly embed appears
- No error messages displayed
- Console may show integration errors

### Integration Points
- Marketplace → Profile (working)
- Profile → Booking page (working)
- Booking page → Calendly embed (failing)
- Calendly → Stripe payment (not yet tested)
- Payment → Confirmation (not yet tested)

### Required Configurations
```javascript
// Calendly configuration
const calendlyConfig = {
  url: process.env.CALENDLY_EVENT_URL,
  prefill: {
    email: user.email,
    name: user.name,
  },
  utm: {
    utmSource: 'buildappswith',
    utmMedium: 'marketplace',
    utmCampaign: 'booking'
  }
};

// Stripe configuration
const stripeConfig = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`
};
```

### Error Scenarios to Handle
1. Calendly embed fails to load
2. User not authenticated
3. Invalid builder profile
4. Stripe checkout creation fails
5. Payment processing errors
6. Webhook delivery failures
7. Network connectivity issues
8. API rate limiting

## Implementation Priority
1. Fix Calendly embed loading issue
2. Configure Calendly API credentials
3. Test booking flow with real availability
4. Implement Stripe checkout creation
5. Add webhook handlers
6. Create error boundaries
7. Add loading states
8. Test complete flow
9. Document configuration
10. Prepare for production

## Success Criteria
- User can view Liam's real availability in Calendly
- Booking selection triggers Stripe payment
- Payment success creates booking record
- Confirmation page shows booking details
- Error states are handled gracefully
- Dummy profiles show appropriate messaging
- Complete flow works in production
- All credentials are securely configured
- Monitoring and logging are in place
- Documentation is comprehensive

## Session Notes
This is a critical revenue-enabling feature that must work flawlessly in production. Focus on getting 
the happy path working first for Liam's profile, then add error handling and edge cases. Ensure all 
API credentials are properly secured and that the integration is resilient to failures.

Remember: Development and Production use separate databases, not branches. Production email is 
liam@buildappswith.com (not .ai).

## Security Considerations
- API keys must be in environment variables
- Webhook endpoints need signature verification
- User authentication required for booking
- CORS properly configured for embeds
- CSP headers allow Calendly/Stripe domains
- Payment amounts verified server-side
- Webhook retries handled idempotently
- PII properly protected in logs