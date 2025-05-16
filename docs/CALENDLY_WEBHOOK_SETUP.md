# Calendly Webhook Configuration Guide

## Required Steps for Calendly Dashboard

### 1. Access Webhook Settings
1. Log in to Calendly dashboard
2. Navigate to Account Settings > Integrations > Webhooks
3. Click "Create webhook subscription"

### 2. Configure Webhook Endpoint
Configure the following settings:

**Webhook URL**: `https://www.buildappswith.com/api/webhooks/calendly`
- For staging: `https://staging.buildappswith.com/api/webhooks/calendly`

**Events to Subscribe**:
- ✅ invitee.created (Booking confirmations)
- ✅ invitee.canceled (Booking cancellations)
- ✅ routing_form_submission.created (Optional: for form submissions)

**Request Format**: JSON

### 3. Webhook Signing Secret
1. After creating the webhook, Calendly will provide a signing secret
2. Copy this secret and add to your environment variables:
   ```
   CALENDLY_WEBHOOK_SIGNING_KEY=your_webhook_signing_secret
   ```
3. Update this in Vercel environment variables

### 4. Test the Webhook
1. Use Calendly's test feature to send a test event
2. Check your logs to confirm receipt
3. Verify signature validation is working

### 5. Production Checklist
- [ ] Webhook URL is using HTTPS
- [ ] Signing secret is properly configured
- [ ] Error handling is in place
- [ ] Logging is enabled for debugging
- [ ] Retry logic is configured in Calendly

## Email Service Recommendations

### Option 1: SendGrid (Recommended)
- **Pros**: 
  - Robust API
  - Good deliverability
  - Transactional email templates
  - Detailed analytics
- **Setup**:
  1. Create SendGrid account
  2. Verify domain
  3. Create API key
  4. Add to environment: `SENDGRID_API_KEY`

### Option 2: Resend
- **Pros**:
  - Developer-friendly API
  - React email support
  - Simple pricing
  - Good documentation
- **Setup**:
  1. Create Resend account
  2. Verify domain
  3. Create API key
  4. Add to environment: `RESEND_API_KEY`

### Option 3: Amazon SES
- **Pros**:
  - Cost-effective for high volume
  - AWS integration
  - High deliverability
- **Cons**:
  - More complex setup
  - Requires domain verification

## Email Integration Strategy

### For Booking Confirmations
**Use Our System**: We should send booking confirmations ourselves rather than relying on Calendly's emails. This gives us:
- Brand consistency
- Custom templates
- Better tracking
- Ability to include custom information (payment details, pathways, etc.)

### Implementation Plan
```typescript
// Update /lib/scheduling/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData) {
  const msg = {
    to: data.to,
    from: 'noreply@buildappswith.com',
    subject: `Booking Confirmation: ${data.sessionTitle}`,
    html: generateBookingConfirmationHTML(data),
    text: generateBookingConfirmationText(data)
  };
  
  await sgMail.send(msg);
}
```

### When to Use Calendly Workflows
- **Meeting Reminders**: Let Calendly handle automatic reminders
- **Calendar Invites**: Calendly handles calendar integration
- **Reschedule Notifications**: Calendly manages these automatically

### When to Use Our System
- **Booking Confirmations**: Custom branded emails
- **Payment Receipts**: After successful payment
- **Pathway Progress**: Updates on learning progress
- **Custom Notifications**: Platform-specific communications

## Stripe API Key Security Update

Regarding the Stripe security alert, this was likely triggered by:
1. The cookie warnings in the console
2. Possible exposure in client-side code
3. Development environment testing

### Actions Taken
- ✅ Updated production Stripe API key
- ✅ Saved new key to Vercel

### Additional Security Measures
1. Ensure all Stripe keys are server-side only
2. Never expose secret keys in client code
3. Use environment variables consistently
4. Implement proper error handling to prevent key exposure in logs

## Console Error Investigation

The Calendly errors are due to empty error objects in the logger. We've fixed this by updating the error handling in `calendly-calendar.tsx` to properly serialize error objects.

## Next Steps

1. **Set up Calendly webhook in dashboard**
   - Follow the step-by-step guide above
   - Test with a sample booking

2. **Choose and integrate email service**
   - Recommend starting with SendGrid
   - Update email.ts with actual implementation

3. **Deploy to production**
   - Add all environment variables to Vercel
   - Deploy and test the complete flow

4. **Monitor initial usage**
   - Check webhook delivery
   - Monitor error rates
   - Review booking completion rates